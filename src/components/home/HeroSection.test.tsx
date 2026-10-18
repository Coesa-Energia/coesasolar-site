import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "./HeroSection";

vi.mock("@/hooks/useConfiguracoes", () => ({ useConfiguracoes: () => ({ configs: { hero_stats: "[]" } }) }));
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, useReducedMotion: () => true, useScroll: () => ({ scrollYProgress: 0 }), useTransform: () => 0 };
});

describe("hero COESA no estilo Gridora", () => {
  it("preserva o H1 e mostra a condição do plano como H2", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Energia Solar por Assinatura");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("20% de desconto na energia compensada pela COESA. Sem placas, obras ou investimento.");
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
});
