import { describe, expect, it } from "vitest";
import { simulationFormSchema } from "./SimulationForm";

const validSubmission = {
  nome: "Maria Silva",
  telefone: "(31) 99999-9999",
  email: "maria@example.com",
  concessionaria: "CEMIG",
};

describe("SimulationForm", () => {
  it("aceita conta a partir de R$ 300 por mês", () => {
    expect(simulationFormSchema.safeParse({ ...validSubmission, valorConta: "R$ 299,99" }).success).toBe(false);
    expect(simulationFormSchema.safeParse({ ...validSubmission, valorConta: "R$ 300,00" }).success).toBe(true);
  });
});
