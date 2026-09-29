import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import InvestimentosPage, { metadata } from "./page"

describe("InvestimentosPage", () => {
  it("publica os dados da rodada sem afirmar que o aporte já foi recebido", () => {
    const { container } = render(<InvestimentosPage />)

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("R$ 2 milhões")
    expect(screen.getByText("60.937.217/0001-54")).toBeInTheDocument()
    expect(screen.getByText("33.672.634/0001-40")).toBeInTheDocument()
    expect(screen.getByText("Rodada pre-seed via mútuo conversível")).toBeInTheDocument()
    expect(container).toHaveTextContent("Não representa declaração de que o valor integral já foi transferido ou recebido")
    expect(container).not.toHaveTextContent("concluiu um aporte")
  })

  it("expõe canonical público", () => {
    expect(metadata.alternates).toEqual({ canonical: "https://coesasolar.com.br/investimentos" })
  })
})
