// REGRESSÃO 02/10/2026 — auditoria SEO/agentic (Lighthouse "agent-accessibility-tree"
// FAIL): botão do menu mobile, ícones de redes sociais e <select> do simulador sem nome
// acessível. E o hero carregava o iframe do YouTube no HTML inicial (1 MB de JS no LCP
// mobile, título/controles do player sobre os CTAs).
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/integrations/supabase/client", () => {
  const q = { select: () => q, eq: () => q, order: () => q, single: async () => ({ data: null, error: { message: "x" } }), then: (r: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(r) }
  return { supabase: { from: () => q } }
})

// Simulador fora do estado de carregamento (o <select> só aparece com dados).
vi.mock("@/hooks/useEconomyCalculator", async (orig) => ({
  ...(await orig<typeof import("@/hooks/useEconomyCalculator")>()),
  useEconomyCalculator: () => ({
    config: { disponibilidadeMonofasico: 30, disponibilidadeBifasico: 50, disponibilidadeTrifasico: 100, cipDefault: 25, tarifaFallback: 0.86, pisCofinsAliquota: 0.0925, inflacaoEnergetica: 0.08, unlockThreshold: 0, descontoDefault: 20, fidelidadeDefault: 5 },
    concessionarias: [{ id: "1", nome: "CEMIG", uf: "MG", tarifa: 0.86 }],
    loading: false,
    calcular: () => null,
    getWhatsAppLink: () => "#",
  }),
}))

import { HomeNavbar } from "./HomeNavbar"
import { HomeFooter } from "./HomeFooter"
import { EconomyCalculator } from "./EconomyCalculator"
import { HeroSection } from "./HeroSection"
import { TooltipProvider } from "@/components/ui/tooltip"

function semNome(html: string, tag: "button" | "a" | "select") {
  const re = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, "g")
  return [...html.matchAll(re)]
    // <option> não dá nome ao <select>: ele precisa de aria-label (ou label associado).
    .filter(([, attrs, inner]) => !/aria-label="[^"]+"/.test(attrs) && (tag === "select" || (!inner.replace(/<[^>]+>/g, "").trim() && !/alt="[^"]+"/.test(inner))))
    .map(([m]) => m.slice(0, 120))
}

describe("REGRESSÃO: controles da home com nome acessível", () => {
  it.each([
    ["HomeNavbar", () => <HomeNavbar />],
    ["HomeFooter", () => <HomeFooter />],
    ["EconomyCalculator", () => <TooltipProvider><EconomyCalculator /></TooltipProvider>],
  ])("%s", (_, El) => {
    const html = renderToString(<El />)
    if (_ === "EconomyCalculator") expect(html.match(/<select\b/g)?.length).toBe(2)
    for (const tag of ["button", "a", "select"] as const) expect(semNome(html, tag), tag).toEqual([])
  })
})

describe("REGRESSÃO: hero sem iframe do YouTube no HTML inicial", () => {
  it("renderiza a miniatura como fundo e adia o iframe", () => {
    const html = renderToString(<HeroSection />)
    expect(html).not.toContain("<iframe")
    expect(html).toMatch(/i\.ytimg\.com\/vi\/[\w-]+\/maxresdefault\.jpg/)
  })

  it("não monta o player em tela pequena", () => {
    const src = readFileSync(join(__dirname, "HeroSection.tsx"), "utf-8")
    expect(src).toMatch(/max-width: 767px/)
  })
})
