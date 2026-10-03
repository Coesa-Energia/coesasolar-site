// REGRESSÃO 03/10/2026 — os defaults de useConfiguracoes (fonte efetiva, já que a
// tabela configuracoes_sistema está inacessível) eram placeholders: CNPJ
// 00.000.000/0001-00, "Av. Paulista, 1000", telefone (11) 99999-9999, WhatsApp
// 5511999999999 — usados no rodapé e nos PDFs de proposta. Sem NAP real no site.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/integrations/supabase/client", () => {
  const q = { select: () => q, eq: () => q, order: () => q, single: async () => ({ data: null, error: { message: "x" } }), then: (r: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(r) }
  return { supabase: { from: () => q } }
})

import { HomeFooter } from "@/components/home/HomeFooter"
import { buildHomeJsonLd } from "@/lib/seo/home-jsonld"

const PLACEHOLDERS = /00\.000\.000\/0001-00|Av\. Paulista|99999-9999|5511999999999|5531999999999/

describe("REGRESSÃO: dados reais da empresa no lugar dos placeholders", () => {
  it("useConfiguracoes não tem placeholders nos defaults", () => {
    const src = readFileSync(join(__dirname, "..", "hooks", "useConfiguracoes.ts"), "utf-8")
    expect(src).not.toMatch(PLACEHOLDERS)
  })

  it("rodapé mostra CNPJ, endereço e WhatsApp reais", () => {
    const html = renderToString(<HomeFooter />)
    expect(html).toContain("60.937.217/0001-54")
    expect(html).toContain("Belo Horizonte")
    expect(html).toContain("wa.me/5531936185192")
    expect(html).not.toMatch(PLACEHOLDERS)
  })

  it("JSON-LD da Organization traz taxID, endereço e redes oficiais", () => {
    const org = buildHomeJsonLd()["@graph"][0] as Record<string, unknown>
    expect(org.taxID).toBe("60.937.217/0001-54")
    expect((org.address as Record<string, string>).addressLocality).toBe("Belo Horizonte")
    expect(org.sameAs).toContain("https://www.instagram.com/coesaenergia/")
  })
})
