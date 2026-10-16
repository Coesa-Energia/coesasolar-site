import { act, render, screen, waitFor } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { motionValue } from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { ProgressiveFluxBar } from "./ProgressiveFluxBar";

const reducedMotion = vi.hoisted(() => ({ value: false }));
vi.mock("framer-motion", async (importOriginal) => ({
  ...await importOriginal<typeof import("framer-motion")>(),
  useReducedMotion: () => reducedMotion.value,
}));

describe("ProgressiveFluxBar", () => {
  it("hidrata sem adicionar brilho quando o navegador pede movimento reduzido", async () => {
    const scrollProgress = motionValue(0);
    reducedMotion.value = false;
    const html = renderToString(<ProgressiveFluxBar scrollProgress={scrollProgress} />);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    reducedMotion.value = true;
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <ProgressiveFluxBar scrollProgress={scrollProgress} />, { onRecoverableError: (error) => errors.push(error) });
      });
      expect(errors).toEqual([]);
      expect(container.querySelector("span")).toBeNull();
    } finally {
      await act(async () => root?.unmount());
      container.remove();
      reducedMotion.value = false;
    }
  });

  it("revela até 20% conforme o scroll sem alterar o desconto anunciado", async () => {
    const scrollProgress = motionValue(0);
    render(<ProgressiveFluxBar scrollProgress={scrollProgress} />);
    const bar = screen.getByRole("progressbar", { name: "Desconto COESA" });
    const fill = bar.firstElementChild as HTMLElement;

    expect(fill).toHaveStyle({ width: "0%" });
    act(() => scrollProgress.set(0.5));
    await waitFor(() => expect(fill).toHaveStyle({ width: "10%" }));
    act(() => scrollProgress.set(1));
    await waitFor(() => expect(fill).toHaveStyle({ width: "20%" }));
    expect(bar).toHaveAttribute("aria-valuetext", "20% de desconto COESA");
  });
});
