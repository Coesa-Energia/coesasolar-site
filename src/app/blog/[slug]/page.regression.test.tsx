// REGRESSÃO 03/10/2026 — auditoria SEO (E-E-A-T): posts sem assinatura explícita
// ("Coesa Solar · data") e data formatada em UTC no servidor (post das 23:30 UTC
// aparecia com o dia seguinte para o leitor brasileiro).
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

const article = {
  slug: "x", title: "Título", page_title: null, meta_desc: "d", keyword: "k", category: "guias",
  cover_url: null, content: "## Seção\n\nTexto.", published_at: "2026-09-30T23:30:00Z",
  guest_author: null, guest_bio: null, guest_url: null,
}
vi.mock("@/lib/blog/supabase-blog", () => ({ getArticleBySlug: async () => article }))
vi.mock("@/components/blog/Comments", () => ({ default: () => null }))
vi.mock("@/components/blog/CommentForm", () => ({ default: () => null }))
vi.mock("@/components/blog/ArticleMetrics", () => ({ default: () => null }))
vi.mock("@/components/blog/LeadForm", () => ({ default: () => null }))
vi.mock("@/components/blog/EndCta", () => ({ default: () => null }))

import ArticlePage from "./page"

describe("REGRESSÃO: assinatura e data do post", () => {
  it("assina como Equipe COESA Energia Inteligente e data no fuso de São Paulo", async () => {
    const html = renderToString(await ArticlePage({ params: Promise.resolve({ slug: "x" }) }))
    expect(html).toContain("Equipe COESA Energia Inteligente")
    expect(html).toContain("30 de setembro de 2026")
  })
})
