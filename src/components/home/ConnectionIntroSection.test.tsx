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
  it("exibe a nova mensagem e o progresso no lugar dos cartões antigos", () => {
    const { container } = render(<ConnectionIntroSection />);
    expect(screen.getByRole("heading", { name: "Por que COESA" })).toBeInTheDocument();
    expect(container.querySelector("#conexao")).toHaveTextContent("A maneira com que você se locomove na cidade, mudou.");
    expect(container.querySelector("#conexao")).toHaveTextContent("A COESA Energia Inteligente conecta você às nossas usinas em poucos cliques:");
    expect(container.querySelector("#conexao")).toHaveTextContent("Sem placas, obras ou investimento inicial, oferecemos desconto na energia, com tarifa mais barata, todos os meses!");
    expect(container.querySelector("#conexao")).toHaveTextContent("Tudo... na palma da mão.");
    expect(screen.getByText("ENERGIA EM MOVIMENTO")).toBeInTheDocument();
    expect(screen.queryByText("Adesão R$ 0")).not.toBeInTheDocument();
  });
});
