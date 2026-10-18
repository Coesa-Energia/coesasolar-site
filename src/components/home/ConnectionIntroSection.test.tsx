import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectionIntroSection } from "./ConnectionIntroSection";

vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal<typeof import("framer-motion")>(),
  useReducedMotion: () => true,
  useScroll: () => ({ scrollYProgress: 0 }),
  useTransform: () => 0,
}));

describe("segunda dobra COESA", () => {
  it("exibe o manifesto completo e o progresso no lugar dos cartões antigos", () => {
    const { container } = render(<ConnectionIntroSection />);
    expect(screen.getByRole("heading", { name: "Por que COESA" })).toBeInTheDocument();
    expect(container.querySelector("#conexao")).toHaveTextContent("Todos os meses, nossas usinas geram energia suficiente para alimentar uma cidadezinha inteira.");
    expect(container.querySelector("#conexao")).toHaveTextContent("Mais de 2.000 clientes já confiam na COESA.");
    expect(container.querySelector("#conexao")).toHaveTextContent("Sem obra na sua casa. Sem burocracia. Sem custo inicial nenhum.");
    expect(screen.getByText("ENERGIA EM MOVIMENTO")).toBeInTheDocument();
    expect(screen.queryByText("Adesão R$ 0")).not.toBeInTheDocument();
  });
});
