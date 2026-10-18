import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeferredConnectionIntroSection } from "./DeferredConnectionIntroSection";

vi.mock("next/dynamic", () => ({ default: () => () => <div data-testid="animated-intro">Animação ativa</div> }));
afterEach(() => { vi.unstubAllGlobals(); window.history.replaceState({}, "", "/"); });

describe("manifesto carregado antes da rolagem", () => {
  it("mantém o texto no HTML e ativa a animação ao se aproximar", () => {
    let notify: IntersectionObserverCallback | undefined;
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe() {}
      disconnect() {}
    });

    const { container } = render(<DeferredConnectionIntroSection />);
    expect(container.querySelector("#conexao")).toHaveAttribute("aria-busy", "true");
    expect(container.textContent).toContain("Por que só a nossa maneira de pensar energia é a mesma?");
    expect(screen.queryByTestId("animated-intro")).not.toBeInTheDocument();

    act(() => notify?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByTestId("animated-intro")).toBeInTheDocument();
  });

  it("ativa a animação ao abrir a âncora diretamente", () => {
    window.history.replaceState({}, "", "/#conexao");
    render(<DeferredConnectionIntroSection />);
    expect(screen.getByTestId("animated-intro")).toBeInTheDocument();
  });
});
