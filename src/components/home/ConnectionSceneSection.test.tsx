import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ConnectionSceneSection } from "./ConnectionSceneSection"

describe("ConnectionSceneSection", () => {
  it("explica a conexão sem depender do canvas para o conteúdo essencial", () => {
    render(<ConnectionSceneSection />)
        expect(screen.getByRole("heading", { name: /A energia encontra/i })).toBeInTheDocument()
        expect(screen.getByText(/Usinas e clientes passam/i)).toBeInTheDocument()
        expect(screen.getByRole("img", { name: /Cena de scroll/i })).toBeInTheDocument()
    expect(screen.getByText(/Role para acompanhar/i)).toBeInTheDocument()
  })
})
