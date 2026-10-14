import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PredictableBillSection } from "./PredictableBillSection";

describe("PredictableBillSection", () => {
  it("apresenta economia e valor mínimo da fatura", () => {
    render(<PredictableBillSection />);
    expect(screen.getByRole("heading", { name: /Previsibilidade nos custos.*Seu desconto, não/i })).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("R$ 350")).toBeInTheDocument();
  });

  it("mantém o desconto real fixo na barra de fluxo", () => {
    render(<PredictableBillSection />);
    expect(screen.getByRole("progressbar", { name: "Desconto COESA" })).toHaveAttribute("aria-valuenow", "20");
    expect(screen.queryByRole("button", { name: "03 Ondas" })).not.toBeInTheDocument();
  });
});
