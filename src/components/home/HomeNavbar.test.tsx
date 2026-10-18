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

  describe("REGRESSÃO: botão Acesso sem contraste (texto branco em fundo branco)", () => {
    // variant="outline" do Button já define bg-background (branco) — sem
    // bg-transparent no className, o fundo branco do variant vence e o
    // text-white fica ilegível. CTASection.tsx e HeroSection.tsx já tinham
    // bg-transparent; só o HomeNavbar esqueceu.
    it("o botão Acesso do menu desktop tem bg-transparent", () => {
      render(<HomeNavbar />)
      const links = screen.getAllByRole("link", { name: "Acesso" })
      expect(links[0].className).toContain("bg-transparent")
    })
  })

  it("mantém o acesso do cliente no desktop e no menu móvel", () => {
    render(<HomeNavbar />)
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }))
    for (const link of screen.getAllByRole("link", { name: "Acesso" })) {
      expect(link).toHaveAttribute("href", "https://cliente.coesaenergia.com.br/login")
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
