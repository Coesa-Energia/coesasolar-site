import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "./HeroSection";

vi.mock("@/hooks/useConfiguracoes", () => ({ useConfiguracoes: () => ({ configs: { hero_stats: JSON.stringify([
  { icon: "Zap", value: "20%", label: "Economia" },
  { icon: "Leaf", value: "100%", label: "Energia Limpa" },
  { icon: "Shield", value: "5 anos", label: "Garantia" },
  { icon: "Clock", value: "0", label: "Investimento" },
]) } }) }));
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, useReducedMotion: () => true, useScroll: () => ({ scrollYProgress: 0 }), useTransform: () => 0 };
});

describe("hero COESA no estilo Gridora", () => {
  it("preserva o H1 e mostra a condição do plano como H2", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Energia Solar por Assinatura");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("20% de desconto na energia. Sem placas, obras ou investimento.");
    expect(screen.getByText("Sua nova maneira de pensar energia!")).toBeInTheDocument();
    expect(screen.getByText("A energia das nossas usinas chegando até a sua casa")).toBeInTheDocument();
    expect(screen.queryByText("Garantia")).not.toBeInTheDocument();
    expect(screen.getByText("Economia")).toBeInTheDocument();
    expect(screen.getByText("Energia Limpa")).toBeInTheDocument();
    expect(screen.getByText("Investimento")).toBeInTheDocument();
  });

  it("alterna a cena de dia para noite e mantém o controle acessível", () => {
    const { container } = render(<HeroSection />);
    const day = screen.getByRole("button", { name: /Dia Usinas parceiras geram/ });
    const night = screen.getByRole("button", { name: /Noite A economia continua/ });
    expect(day).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector("#inicio")).toHaveAttribute("data-scene", "day");
    fireEvent.click(night);
    expect(night).toHaveAttribute("aria-pressed", "true");
    expect(day).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector("#inicio")).toHaveAttribute("data-scene", "night");
    expect(screen.getByText(/Os créditos são compensados na sua fatura/)).toBeInTheDocument();
  });

  it("abre a simulação com telefone e valor preenchidos", () => {
    render(<HeroSection />);
    const onOpen = vi.fn();
    window.addEventListener("coesa:open-lead-form", onOpen, { once: true });
    fireEvent.change(screen.getByRole("textbox", { name: "WhatsApp" }), { target: { value: "11999999999" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Valor da conta" }), { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: "Continuar →" }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect((onOpen.mock.calls[0][0] as CustomEvent).detail).toMatchObject({ source: "hero_form", prefill: { telefone: "(11) 99999-9999", valorConta: "R$ 500,00" } });
    expect(screen.queryByText("Imagem ilustrativa. A assinatura COESA não exige painéis no imóvel.")).not.toBeInTheDocument();
  });
});
