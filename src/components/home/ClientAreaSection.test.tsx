import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClientAreaSection } from "./ClientAreaSection";

describe("ClientAreaSection", () => {
  it("mostra app e Área do Cliente sem esconder as telas atrás de seletores", () => {
    render(<ClientAreaSection />);
    expect(document.querySelectorAll("section#app-coesa, section#area-do-cliente, section#area-do-cliente-detalhes")).toHaveLength(3);
    const app = screen.getByLabelText("Três telas do app COESA");
    expect(within(app).getByLabelText("Tela do app: Olá, Ana!")).toBeInTheDocument();
    expect(within(app).getByLabelText("Tela do app: Suas faturas")).toBeInTheDocument();
    expect(within(app).getByLabelText("Tela do app: Seu plano")).toBeInTheDocument();
    expect(screen.getByLabelText("Painel desktop da Área do Cliente")).toBeInTheDocument();
    expect(screen.getByLabelText("Prévia das faturas na Área do Cliente")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A economia aparece em cada fatura." })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Dispositivo da prévia" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Acessar Área do Cliente/ })).toHaveAttribute("href", "https://relatorios.coesasolar.com.br/");
  });
});
