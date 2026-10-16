import { act, render, screen } from "@testing-library/react"
import { Profiler } from "react"
import { describe, expect, it, vi } from "vitest"
import { ConnectionSceneSection } from "./ConnectionSceneSection"

const scroll = vi.hoisted(() => ({ onChange: (_value: number) => {} }))

vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal<typeof import("framer-motion")>(),
  useScroll: () => ({ scrollYProgress: {} }),
  useMotionValueEvent: (_value: unknown, _event: string, callback: (value: number) => void) => { scroll.onChange = callback },
  useReducedMotion: () => false,
}))

describe("ConnectionSceneSection", () => {
  it("explica a conexão sem depender do canvas para o conteúdo essencial", () => {
    render(<ConnectionSceneSection />)
    expect(screen.getByRole("heading", { name: /A energia encontra/i })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Fluxo de energia/i })).toBeInTheDocument()
    expect(screen.getAllByText(/usinas/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/distribuidora cuida dos fios/i)).toBeInTheDocument()
    expect(screen.getByText(/créditos entram na conta/i)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Simular minha conta/i })).not.toBeInTheDocument()
  })

  it("mostra as três cenas e mantém a seção fixa também no celular", () => {
    const onRender = vi.fn()
    const { container } = render(<Profiler id="connection" onRender={onRender}><ConnectionSceneSection /></Profiler>)
    expect(container.querySelector("#rede")?.className).toContain("h-[300svh]")
    expect(container.querySelector("#rede > div")?.className).toContain("sticky top-20")
    expect(onRender).toHaveBeenCalledTimes(1)

    act(() => scroll.onChange(0.5))
    expect(screen.getByRole("heading", { name: /A energia circula/i })).toBeInTheDocument()

    act(() => scroll.onChange(1))
    expect(screen.getByRole("heading", { name: /Do outro lado/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Simular minha conta/i })).toBeInTheDocument()
    expect(onRender).toHaveBeenCalledTimes(3)
    expect(screen.getByRole("img", { name: /Fluxo de energia/i })).toBeInTheDocument()
  })
})
