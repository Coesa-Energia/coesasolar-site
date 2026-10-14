import { afterEach, describe, expect, it, vi } from "vitest";
import { formatLeadBill, formatLeadBillInput, openLeadForm, trackLeadEvent } from "./lead-funnel";

afterEach(() => {
  delete (window as Window & { gtag?: unknown }).gtag;
});

describe("lead funnel", () => {
  it("preserva valores em reais sem convertê-los em centavos", () => {
    expect(formatLeadBill("500")).toBe("R$ 500,00");
    expect(formatLeadBill("1.250,50")).toBe("R$ 1.250,50");
    expect(formatLeadBill("1.250")).toBe("R$ 1.250,00");
    expect(formatLeadBill("R$ 300,00")).toBe("R$ 300,00");
  });

  it("mostra máscara monetária durante a digitação e completa centavos ao sair", () => {
    expect(formatLeadBillInput("1000")).toBe("R$ 1.000");
    expect(formatLeadBillInput("R$ 1.000,5")).toBe("R$ 1.000,5");
    expect(formatLeadBill("R$ 1.000,5")).toBe("R$ 1.000,50");
  });

  it("passa dados apenas ao formulário e envia ao analytics só evento e origem", () => {
    const gtag = vi.fn();
    (window as Window & { gtag?: unknown }).gtag = gtag;
    const listener = vi.fn();
    window.addEventListener("coesa:open-lead-form", listener);

    openLeadForm("hero_form", { telefone: "31999999999", valorConta: "R$ 500,00" });
    trackLeadEvent("generate_lead", "hero_form");

    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      source: "hero_form",
      prefill: { telefone: "31999999999", valorConta: "R$ 500,00" },
    });
    expect(gtag.mock.calls).toEqual([
      ["event", "lead_cta_click", { source: "hero_form" }],
      ["event", "generate_lead", { source: "hero_form" }],
    ]);
    window.removeEventListener("coesa:open-lead-form", listener);
  });
});
