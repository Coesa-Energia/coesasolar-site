import { fireEvent, render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { HomeNavbar } from "./HomeNavbar"
import { WhatsAppFloatingButton } from "./WhatsAppFloatingButton"

describe("HomeNavbar", () => {
  it("tem o link Carreiras apontando para /carreiras", () => {
    render(<HomeNavbar />)
    const link = screen.getByRole("link", { name: "Carreiras" })
    expect(link).toHaveAttribute("href", "/carreiras")
  })

  it("não divulga a página de Investimentos nos menus", () => {
    render(<HomeNavbar />)
    expect(screen.queryByRole("link", { name: "Investimentos" })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }))
    expect(screen.queryByRole("link", { name: "Investimentos" })).not.toBeInTheDocument()
  })

  it("exibe a logomarca ampliada sem distorcer a proporção", () => {
    render(<HomeNavbar />)
    const logo = screen.getByRole("img", { name: "COESA" })
    expect(logo.className).toContain("h-10")
    expect(logo.className).toContain("lg:h-14")
    expect(logo.className).toContain("w-auto")
  })

  describe("REGRESSÃO: controle Acesso sem contraste (texto branco em fundo branco)", () => {
    it("o controle Acesso do menu desktop tem bg-transparent", () => {
      render(<HomeNavbar />)
      const links = screen.getAllByRole("link", { name: "Acesso" })
      expect(links[0].parentElement?.className).toContain("bg-transparent")
    })
  })

  it("separa o acesso do cliente e do AIOS no desktop e no menu móvel", () => {
    render(<HomeNavbar />)
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }))
    for (const link of screen.getAllByRole("link", { name: "Acesso" })) {
      expect(link).toHaveAttribute("href", "https://cliente.coesaenergia.com.br/login")
    }
    for (const link of screen.getAllByRole("link", { name: "AIOS" })) {
      expect(link).toHaveAttribute("href", "https://relatorios.coesasolar.com.br/")
    }
  })

  it("mantém o WhatsApp atrás do menu móvel para não cobrir Acesso", () => {
    render(<><HomeNavbar /><WhatsAppFloatingButton /></>)
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }))
    const menu = screen.getAllByRole("link", { name: "Acesso" }).at(-1)?.closest(".fixed")
    const whatsapp = screen.getByRole("link", { name: "Fale conosco no WhatsApp" })
    const menuLayer = Number(menu?.className.match(/\bz-(\d+)\b/)?.[1])
    const whatsappLayer = Number(whatsapp.className.match(/\bz-(\d+)\b/)?.[1])
    expect(whatsappLayer).toBeLessThan(menuLayer)
  })
})
