import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeferredHomeSection } from "./DeferredHomeSection";

vi.mock("next/dynamic", () => ({ default: () => () => <span>Módulo carregado</span> }));

afterEach(() => vi.unstubAllGlobals());

describe("seções da home carregadas perto da tela", () => {
  it("monta a seção imediatamente quando há preferência por menos movimento", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<DeferredHomeSection section="rede" />);
    expect(screen.getByText("Módulo carregado")).toBeInTheDocument();
  });

  it("reserva a altura e a âncora da animação da rede", () => {
    vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
    const { container } = render(<DeferredHomeSection section="rede" />);
    expect(container.querySelector("#rede")).toHaveStyle({ minHeight: "400svh", background: "rgb(9, 11, 9)" });
    expect(screen.queryByText("Módulo carregado")).not.toBeInTheDocument();
  });

  it("mantém o espaço e monta o módulo quando se aproxima", () => {
    let notify: IntersectionObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = observe;
      disconnect = disconnect;
    });

    const { container } = render(<DeferredHomeSection section="usina" />);
    expect(container.querySelector("#usina-solar")).toHaveAttribute("aria-busy", "true");
    expect(observe).toHaveBeenCalledOnce();
    expect(screen.queryByText("Módulo carregado")).not.toBeInTheDocument();

    act(() => notify?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByText("Módulo carregado")).toBeInTheDocument();
    expect(disconnect).toHaveBeenCalled();
  });
});
