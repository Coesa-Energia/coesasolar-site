import { act, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "framer-motion";
import { describe, expect, it } from "vitest";
import { ProgressiveFluxBar } from "./ProgressiveFluxBar";

describe("ProgressiveFluxBar", () => {
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
