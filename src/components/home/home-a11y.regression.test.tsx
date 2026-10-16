// REGRESSÃO 02/10/2026 — auditoria SEO/agentic (Lighthouse "agent-accessibility-tree"
// FAIL): botão do menu mobile, ícones de redes sociais e <select> do simulador sem nome
// acessível. O hero mantém um vídeo ambiente sem controles, foco ou interação.
import { renderToString } from "react-dom/server"
import { act, fireEvent, render, screen } from "@testing-library/react"
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
    ["EconomyCalculator", () => <EconomyCalculator />],
  ])("%s", (_, El) => {
    const html = renderToString(<El />)
    if (_ === "EconomyCalculator") {
      expect(html).toContain('id="valor-conta-simulacao"')
      expect(html).not.toContain('<select')
      expect(html).not.toContain('Ajustar dados da fatura')
    }
    for (const tag of ["button", "a", "select"] as const) expect(semNome(html, tag), tag).toEqual([])
  })
})

describe("REGRESSÃO: animação ambiente do hero sem player visível", () => {
  it("renderiza o timelapse local sem controles nem interação", () => {
    const html = renderToString(<HeroSection />)
    expect(html).toContain('/media/hero-clouds-timelapse.webm?v=3')
    expect(html).toContain('/media/hero-clouds-timelapse.mp4?v=3')
    expect(html).toContain('/media/hero-clouds-timelapse.gif?v=4')
    expect(html).toContain('<video')
    expect(html).not.toContain('<iframe')
    expect(html).toMatch(/i\.ytimg\.com\/vi\/[\w-]+\/maxresdefault\.jpg/)
  })

  it("reproduz o vídeo de fundo em um quarto da velocidade", async () => {
    let container!: HTMLElement
    await act(async () => { container = render(<HeroSection />).container })
    const video = container.querySelector("video")!
    expect(video.playbackRate).toBe(0.25)
  })
})

it("o botão Como funciona do hero leva à seção do processo", async () => {
  const section = document.createElement("section")
  section.id = "como-funciona"
  section.scrollIntoView = vi.fn()
  document.body.append(section)
  await act(async () => { render(<HeroSection />) })
  fireEvent.click(screen.getByRole("button", { name: "Como funciona" }))
  expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" })
  section.remove()
})
