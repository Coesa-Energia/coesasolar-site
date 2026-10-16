import { act, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { WhatsAppFloatingButton } from "./WhatsAppFloatingButton";

it("não cobre o formulário móvel enquanto o hero está visível", () => {
  let reportVisibility!: (visible: boolean) => void;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) {
      reportVisibility = (visible) => callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as IntersectionObserver);
    }
    observe() {}
    disconnect() {}
  });

  try {
    render(<><section id="inicio" /><WhatsAppFloatingButton /></>);
    const button = screen.getByRole("link", { name: "Fale conosco no WhatsApp" });
    expect(button.className).toContain("hidden sm:flex");
    act(() => reportVisibility(false));
    expect(button.className).toContain("flex");
    expect(button.className).not.toContain("hidden sm:flex");
  } finally {
    vi.unstubAllGlobals();
  }
});
