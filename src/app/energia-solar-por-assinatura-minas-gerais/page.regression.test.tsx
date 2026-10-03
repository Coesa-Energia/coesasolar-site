// REGRESSÃO 03/10/2026 — auditoria SEO local: nenhuma página de serviço por área
// atendida; rodapé dizia "todo o Brasil" enquanto a operação é em Minas Gerais
// (CEMIG / Energisa MG — CONCESSIONARIAS_ATENDIDAS); âncoras do menu (#faq) quebravam
// fora da home.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/integrations/supabase/client", () => {
  const q = { select: () => q, eq: () => q, order: () => q, single: async () => ({ data: null, error: { message: "x" } }), then: (r: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(r) }
  return { supabase: { from: () => q } }
})

import Page, { metadata } from "./page"

describe("REGRESSÃO: página de serviço Minas Gerais", () => {
  const html = renderToString(<Page />)

  it("H1, canonical e as duas distribuidoras atendidas", () => {
    expect(html).toMatch(/<h1[^>]*>Energia solar por assinatura em Minas Gerais<\/h1>/)
    expect(metadata.alternates?.canonical).toBe("https://coesasolar.com.br/energia-solar-por-assinatura-minas-gerais")
    expect(html).toContain("Clientes CEMIG")
    expect(html).toContain("Clientes Energisa MG")
  })

  it("JSON-LD Service + BreadcrumbList ligado à Organization", () => {
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
    expect(ld["@graph"].map((n: { "@type": string }) => n["@type"])).toEqual(["Service", "BreadcrumbList"])
    expect(ld["@graph"][0].provider["@id"]).toBe("https://coesasolar.com.br/#organization")
  })

  it("rodapé diz Minas Gerais (não 'todo o Brasil') e linka a página", () => {
    expect(html).not.toContain("todo o Brasil")
    expect(html).toContain('href="/energia-solar-por-assinatura-minas-gerais"')
  })

  it("menu e rodapé usam /#âncora (funcionam fora da home)", () => {
    for (const f of ["HomeNavbar.tsx", "HomeFooter.tsx"]) {
      const src = readFileSync(join(__dirname, "../../components/home", f), "utf-8")
      expect(src).not.toMatch(/href: "#/)
    }
  })
})
