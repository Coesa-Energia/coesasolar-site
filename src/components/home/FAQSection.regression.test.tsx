// REGRESSÃO 02/10/2026 — auditoria SEO: com a home passando a renderizar no servidor,
// o FAQ ainda saía como esqueleto (loading=true no 1º render) e o Radix desmontava as
// respostas fechadas — nenhuma pergunta/resposta no HTML inicial.
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }))
import { FAQSection } from "./FAQSection"

describe("REGRESSÃO: FAQ da home no HTML do servidor", () => {
  it("perguntas e respostas saem no HTML inicial", () => {
    const html = renderToString(<FAQSection />)
    expect(html).toContain("O que é energia solar por assinatura?")
    expect(html).toContain("Não precisa instalar nada na sua casa ou empresa")
  })

  it("respostas fechadas ficam no DOM mas ocultas (sem abrir o acordeão inteiro)", () => {
    const html = renderToString(<FAQSection />)
    const regions = html.match(/<div[^>]*role="region"[^>]*>/g) ?? []
    expect(regions.length).toBe(6)
    for (const tag of regions) expect(tag).toMatch(/data-state="closed"/)
    for (const tag of regions) expect(tag).toMatch(/\shidden(=""|\s|>)/)
  })
})
