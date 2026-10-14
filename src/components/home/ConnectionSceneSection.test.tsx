import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ConnectionSceneSection } from "./ConnectionSceneSection"

describe("ConnectionSceneSection", () => {
  it("explica a conexão sem depender do canvas para o conteúdo essencial", () => {
    render(<ConnectionSceneSection />)
    expect(screen.getByRole("heading", { name: /Energia em movimento/i })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Fluxo de energia/i })).toBeInTheDocument()
    expect(screen.getAllByText(/usinas/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/distribuidora cuida dos fios/i)).toBeInTheDocument()
    expect(screen.getByText(/créditos entram na conta/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Simular minha conta/i })).toBeInTheDocument()
    expect(screen.queryByText(/Role para acompanhar/i)).not.toBeInTheDocument()
  })
})
