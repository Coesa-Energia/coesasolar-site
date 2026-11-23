import { Redis } from "@upstash/redis";
import { z } from "zod";

const leadSchema = z.object({
  nome: z.string().trim().min(2).max(200),
  telefone: z.string().max(50).refine((value) => /^\d{10,15}$/.test(value.replace(/\D/g, ""))),
  email: z.string().trim().max(255).email(),
  valorConta: z.string().trim().min(1).max(50),
  concessionaria: z.string().trim().min(1).max(100),
});

type Lead = z.infer<typeof leadSchema>;

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const RATE_LIMIT_TIMEOUT_MS = 2_000;

let redisClient: Redis | null = null;
function getRedis(): Redis | null {
  if (!(process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) || !(process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)) return null;
  if (!redisClient) redisClient = Redis.fromEnv();
  return redisClient;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || request.headers.get("x-real-ip")?.trim() || "unknown").slice(0, 100);
}

async function isRateLimited(request: Request): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    console.warn("Limite de envios de leads desativado: Redis não configurado");
    return false;
  }
  const key = `lead-rl:${clientIp(request)}`;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const count = await Promise.race([
      redis.incr(key).then(async (value) => {
        await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS, "NX");
        return value;
      }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), RATE_LIMIT_TIMEOUT_MS); }),
    ]);
    return count > RATE_LIMIT_MAX;
  } catch {
    console.warn("Falha ao verificar limite de envios de leads; seguindo sem limite");
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function isHoneypotFilled(body: unknown) {
  const website = (body as { website?: unknown } | null)?.website;
  return typeof website === "string" && website.trim() !== "";
}

async function bitrixFetch(url: string, init?: RequestInit) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
}

function normalizeName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

async function resolveConcessionaria(base: string, field: string, name: string): Promise<string | undefined> {
  try {
    const response = await bitrixFetch(`${base}/crm.lead.fields`);
    if (!response.ok) return undefined;
    const data = await response.json();
    const items = data.result?.[field]?.items;
    if (!Array.isArray(items)) return undefined;
    const searchName = normalizeName(name);
    if (!searchName) return undefined;
    const options = items
      .map((item) => ({ item, value: normalizeName(String(item.VALUE || item.value || "")) }))
      .filter((option) => option.value);
    const single = (candidates: typeof options) => (candidates.length === 1 ? candidates[0] : undefined);
    const match =
      options.find(({ value }) => value === searchName || value.split(" - ")[0] === searchName) ??
      single(options.filter(({ value }) => value.includes(searchName) || searchName.includes(value)));
    const id = match?.item.ID || match?.item.id;
    return id ? String(id) : undefined;
  } catch {
    console.error("Falha ao consultar concessionárias no CRM");
    return undefined;
  }
}

async function createLead(lead: Lead, webhook: string) {
  const base = webhook.replace(/\/+$/, "");
  const valueField = process.env.BITRIX24_FIELD_VALOR_CONTA || "UF_CRM_1755817510";
  const utilityField = process.env.BITRIX24_FIELD_CONCESSIONARIA || "UF_CRM_1759750064";
  const utilityId = await resolveConcessionaria(base, utilityField, lead.concessionaria);
  const digits = lead.telefone.replace(/\D/g, "");
  const value = parseFloat(lead.valorConta.replace(/R\$\s*/i, "").replace(/\./g, "").replace(",", ".")) || 0;
  const fields: Record<string, unknown> = {
    TITLE: `[Site] ${lead.nome}`,
    NAME: lead.nome.split(" ")[0],
    LAST_NAME: lead.nome.split(" ").slice(1).join(" ") || "",
    PHONE: [{ VALUE: digits.length === 10 || digits.length === 11 ? `55${digits}` : digits, VALUE_TYPE: "WORK" }],
    EMAIL: [{ VALUE: lead.email, VALUE_TYPE: "WORK" }],
    STATUS_ID: process.env.BITRIX24_STATUS_ID || "UC_9SLRPP",
    SOURCE_ID: "WEB",
    COMMENTS: `Lead gerado pelo site COESA.\n\nValor da conta: ${lead.valorConta}\nConcessionária: ${lead.concessionaria}`,
    [valueField]: `${value}|BRL`,
  };
  if (utilityId) fields[utilityField] = utilityId;
  const response = await bitrixFetch(`${base}/crm.lead.add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  const data = await response.json();
  if (!response.ok || !((typeof data.result === "number" && Number.isSafeInteger(data.result) && data.result > 0) || (typeof data.result === "string" && /^[1-9]\d*$/.test(data.result)))) {
    throw new Error("Falha ao criar lead no CRM");
  }
  return data.result;
}

export async function handleLeadRequest(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Dados inválidos" }, { status: 400 });
  }
  if (isHoneypotFilled(body)) return Response.json({ success: true });
  if (await isRateLimited(request)) {
    return Response.json({ success: false, error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return Response.json({ success: false, error: "Dados inválidos" }, { status: 400 });
  const webhook = process.env.BITRIX24_WEBHOOK_URL;
  if (!webhook) {
    console.error("Webhook do CRM não configurado");
    return Response.json({ success: false, error: "Serviço de envio indisponível" }, { status: 500 });
  }
  try {
    const leadId = await createLead(parsed.data, webhook);
    return Response.json({ success: true, leadId });
  } catch {
    console.error("Falha ao criar lead no CRM");
    return Response.json({ success: false, error: "Não foi possível enviar a simulação" }, { status: 502 });
  }
}
