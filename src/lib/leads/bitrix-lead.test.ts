// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/lead/route";

const lead = { nome: "Maria Silva", telefone: "(31) 99999-8888", email: "maria@example.com", valorConta: "R$ 1.234,56", concessionaria: "CEMIG" };
const request = (body: unknown = lead) => new Request("http://localhost/api/lead", { method: "POST", body: JSON.stringify(body) });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });

beforeEach(() => {
  vi.stubEnv("BITRIX24_WEBHOOK_URL", "https://example.com/rest/1/token/");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("POST /api/lead", () => {
  it("envia o mapeamento ao Bitrix e resolve a concessionária", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ result: { UF_CRM_1759750064: { items: [{ ID: "42", VALUE: "Cemig Distribuição" }] } } })).mockResolvedValueOnce(json({ result: 123 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, leadId: 123 });
    expect(fetchMock.mock.calls[1][0]).toBe("https://example.com/rest/1/token/crm.lead.add");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ fields: {
      TITLE: "[Site] Maria Silva", NAME: "Maria", LAST_NAME: "Silva",
      PHONE: [{ VALUE: "5531999998888", VALUE_TYPE: "WORK" }], EMAIL: [{ VALUE: "maria@example.com", VALUE_TYPE: "WORK" }],
      STATUS_ID: "UC_9SLRPP", SOURCE_ID: "WEB", COMMENTS: "Lead gerado pelo site COESA.\n\nValor da conta: R$ 1.234,56\nConcessionária: CEMIG",
      UF_CRM_1755817510: "1234.56|BRL", UF_CRM_1759750064: "42",
    } });
  });
  it.each(["sem correspondência", "consulta indisponível"])("envia sem concessionária quando %s", async (condition) => {
    const fetchMock = vi.fn();
    if (condition === "consulta indisponível") fetchMock.mockRejectedValueOnce(new Error("timeout"));
    else fetchMock.mockResolvedValueOnce(json({ result: { UF_CRM_1759750064: { items: [{ ID: "7", VALUE: "Outra" }] } } }));
    fetchMock.mockResolvedValueOnce(json({ result: "123" }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(request())).status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).fields).not.toHaveProperty("UF_CRM_1759750064");
  });
  const utilities = [
    { ID: "1", VALUE: "CEMIG - MG" }, { ID: "2", VALUE: "Energisa MG" }, { ID: "3", VALUE: "Energisa Sul-Sudeste - MG/ES/RJ/SP" },
    { ID: "4", VALUE: "Energisa Mato Grosso - MT" }, { ID: "5", VALUE: "CPFL Paulista - SP" }, { ID: "6", VALUE: "Neoenergia Coelba - BA" },
    { ID: "7", VALUE: "OUTROS - ANOTAÇÃO" },
  ];
  it.each([["CEMIG", "1"], ["Energisa MG", "2"], ["  energisa   mato grosso ", "4"], ["Coelba", "6"], ["Outros", "7"], ["Energisa", undefined], ["Energisa Tocantins", undefined]])(
    "resolve a concessionária %s entre itens reais", async (concessionaria, expected) => {
      const fetchMock = vi.fn().mockResolvedValueOnce(json({ result: { UF_CRM_1759750064: { items: utilities } } })).mockResolvedValueOnce(json({ result: 1 }));
      vi.stubGlobal("fetch", fetchMock);
      expect((await POST(request({ ...lead, concessionaria }))).status).toBe(200);
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).fields.UF_CRM_1759750064).toBe(expected);
    },
  );
  it.each([json({ error: "erro privado" }), json({ result: "abc" }), new Error("timeout")])("retorna erro genérico quando a criação falha", async (failure) => {
    const fetchMock = vi.fn().mockResolvedValueOnce(json({ result: {} }));
    if (failure instanceof Error) fetchMock.mockRejectedValueOnce(failure); else fetchMock.mockResolvedValueOnce(failure);
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ success: false, error: "Não foi possível enviar a simulação" });
  });
  it("rejeita dados inválidos antes de chamar o CRM", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    for (const body of [{ ...lead, nome: "A" }, { ...lead, telefone: "123" }, { ...lead, email: "inválido" }, { ...lead, valorConta: "" }, { ...lead, concessionaria: "" }]) {
      expect((await POST(request(body))).status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("retorna erro quando o webhook não está configurado", async () => {
    vi.stubEnv("BITRIX24_WEBHOOK_URL", "");
    expect((await POST(request())).status).toBe(500);
  });
});
