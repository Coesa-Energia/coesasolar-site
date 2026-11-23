import { z } from "zod";

const leadSchema = z.object({
  nome: z.string().trim().min(2).max(200),
  telefone: z.string().max(50).refine((value) => /^\d{10,15}$/.test(value.replace(/\D/g, ""))),
  email: z.string().trim().max(255).email(),
  valorConta: z.string().trim().min(1).max(50),
  concessionaria: z.string().trim().min(1).max(100),
});

type Lead = z.infer<typeof leadSchema>;

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
    const firstWord = searchName.split(" ")[0];
    const match =
      options.find(({ value }) => value === searchName || value.split(" - ")[0] === searchName) ??
      single(options.filter(({ value }) => value.includes(searchName) || searchName.includes(value))) ??
      single(options.filter(({ value }) => value.split(" ")[0] === firstWord));
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
