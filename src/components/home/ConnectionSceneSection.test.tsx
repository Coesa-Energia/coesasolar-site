import { act, render, screen } from "@testing-library/react"
import { Profiler } from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ConnectionSceneSection } from "./ConnectionSceneSection"

const scroll = vi.hoisted(() => ({ onChange: (_value: number) => {}, reducedMotion: false }))

vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal<typeof import("framer-motion")>(),
  useScroll: () => ({ scrollYProgress: {} }),
  useMotionValueEvent: (_value: unknown, _event: string, callback: (value: number) => void) => { scroll.onChange = callback },
  useReducedMotion: () => scroll.reducedMotion,
}))

describe("ConnectionSceneSection", () => {
  it("hidrata sem trocar o texto inicial quando o navegador pede movimento reduzido", async () => {
    scroll.reducedMotion = false
    const html = renderToString(<ConnectionSceneSection />)
    expect(html).toContain("A energia encontra")
    const container = document.createElement("div")
    container.innerHTML = html
    document.body.append(container)
    scroll.reducedMotion = true
    const errors: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    try {
      await act(async () => {
        root = hydrateRoot(container, <ConnectionSceneSection />, { onRecoverableError: (error) => errors.push(error) })
      })
      expect(errors).toEqual([])
      expect(container.textContent).toContain("Do outro lado")
    } finally {
      await act(async () => root?.unmount())
      container.remove()
      scroll.reducedMotion = false
    }
  })

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
    expect(container.querySelector("#rede")?.className).toContain("h-[400svh]")
    expect(container.querySelector("#rede > div")?.className).toContain("sticky top-20")
    expect(onRender).toHaveBeenCalledTimes(2)

    act(() => scroll.onChange(0.5))
    expect(screen.getByRole("heading", { name: /A energia circula/i })).toBeInTheDocument()

    act(() => scroll.onChange(1))
    expect(screen.getByRole("heading", { name: /Do outro lado/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Simular minha conta/i })).toBeInTheDocument()
    expect(onRender).toHaveBeenCalledTimes(4)
    expect(screen.getByRole("img", { name: /Fluxo de energia/i })).toBeInTheDocument()
  })
})
