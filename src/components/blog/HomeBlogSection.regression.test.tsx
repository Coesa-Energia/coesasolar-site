// REGRESSÃO 02/10/2026 — auditoria SEO: os posts do blog estavam "URL is unknown to
// Google" e a home (página com mais autoridade) só listava os artigos via fetch no
// navegador — nenhum link /blog/<slug> no HTML inicial. Com initialArticles vindo do
// servidor, os links precisam sair já no HTML renderizado no servidor.
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { HomeBlogSection } from "./HomeBlogSection"

const articles = [
  { slug: "compensacao-creditos-energia-como-funciona", title: "Compensação de créditos", meta_desc: null, keyword: null, published_at: "2026-09-30T23:30:00Z" },
]

describe("REGRESSÃO: blog da home renderizado a partir do servidor", () => {
  it("com initialArticles, o HTML do servidor já traz o link do post", () => {
    const html = renderToString(<HomeBlogSection initialArticles={articles} />)
    expect(html).toContain('href="/blog/compensacao-creditos-energia-como-funciona"')
  })

  it("sem initialArticles o HTML do servidor não tem links (comportamento antigo, só fetch no navegador)", () => {
    expect(renderToString(<HomeBlogSection />)).not.toContain('href="/blog/')
  })

  it("data no fuso de São Paulo (23:30 UTC de 30/09 = 30 de setembro), igual no servidor e no navegador", () => {
    expect(renderToString(<HomeBlogSection initialArticles={articles} />)).toContain("30 de setembro de 2026")
  })
})
