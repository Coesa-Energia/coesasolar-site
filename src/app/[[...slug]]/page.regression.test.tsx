// REGRESSÃO 02/10/2026 — auditoria SEO completa de coesasolar.com.br:
// (1) soft-404 sitewide: o catch-all entregava o SPA (HTTP 200) para QUALQUER caminho,
//     inclusive inexistente (/pagina-inexistente-xyz, /wp-sitemap.xml, /.well-known/*);
// (2) home com BAILOUT_TO_CLIENT_SIDE_RENDERING: `dynamic(App, { ssr: false })` no
//     page.tsx fazia o HTML inicial chegar só com <head> — 7 palavras para quem não roda JS;
// (3) home sem JSON-LD (nenhuma Organization/WebSite no site inteiro).
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
}))
vi.mock("./HomeClient", () => ({ default: () => null }))
vi.mock("./SpaClient", () => ({ default: () => null }))

import Page, { generateMetadata } from "./page"
import { SPA_ROUTE_PREFIXES } from "@/lib/seo/spa-routes"

const semComentarios = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")
const params = (slug?: string[]) => ({ params: Promise.resolve({ slug }) })

describe("REGRESSÃO: catch-all não pode servir 200 para caminho inexistente", () => {
  it.each([["pagina-inexistente-xyz"], ["wp-sitemap.xml"], [".well-known", "ai-catalog.json"], ["blogg"]])(
    "%s → notFound()",
    async (...slug) => {
      await expect(Page(params(slug))).rejects.toThrow("NEXT_NOT_FOUND")
    },
  )

  it("rotas do SPA continuam servidas (com noindex)", async () => {
    await expect(Page(params(["crm"]))).resolves.toBeTruthy()
    await expect(Page(params(["proposta", "abc-123"]))).resolves.toBeTruthy()
    expect(await generateMetadata(params(["dashboard"]))).toEqual({ robots: { index: false, follow: false } })
  })

  it("home renderiza (não chama notFound) e tem canonical", async () => {
    await expect(Page(params())).resolves.toBeTruthy()
    expect((await generateMetadata(params())).alternates?.canonical).toBe("https://coesasolar.com.br/")
  })

  it("todo prefixo de rota do App.tsx está na allowlist (e só eles)", () => {
    const app = readFileSync(join(__dirname, "..", "..", "App.tsx"), "utf-8")
    const prefixes = new Set(
      [...app.matchAll(/path="\/([^/"]*)/g)].map(m => m[1]).filter(Boolean),
    )
    expect([...SPA_ROUTE_PREFIXES].sort()).toEqual([...prefixes].sort())
  })
})

describe("REGRESSÃO: home renderizada no servidor", () => {
  it("page.tsx não carrega a home via dynamic(..., { ssr: false })", () => {
    const page = semComentarios(readFileSync(join(__dirname, "page.tsx"), "utf-8"))
    expect(page).not.toMatch(/ssr:\s*false/)
    expect(page).not.toMatch(/^"use client"/)
    const home = semComentarios(readFileSync(join(__dirname, "HomeClient.tsx"), "utf-8"))
    expect(home).not.toMatch(/ssr:\s*false/)
    expect(home).toMatch(/from "@\/screens\/Index"/)
  })

  it("home publica JSON-LD com Organization, WebSite e Service", async () => {
    const el = (await Page(params())) as { props: { children: Array<{ type: string; props: { dangerouslySetInnerHTML: { __html: string } } }> } }
    const script = el.props.children.find(c => c.type === "script")!
    const graph = JSON.parse(script.props.dangerouslySetInnerHTML.__html)["@graph"]
    expect(graph.map((n: { "@type": string }) => n["@type"])).toEqual(["Organization", "WebSite", "Service"])
    expect(graph[0].name).toBe("COESA Energia Inteligente")
  })

  it("JSON-LD não carrega placeholders de useConfiguracoes (CNPJ/endereço/telefone fictícios)", async () => {
    const el = (await Page(params())) as { props: { children: Array<{ type: string; props: { dangerouslySetInnerHTML: { __html: string } } }> } }
    const html = el.props.children.find(c => c.type === "script")!.props.dangerouslySetInnerHTML.__html
    expect(html).not.toMatch(/00\.000\.000|Av\. Paulista|99999-9999/)
  })
})
