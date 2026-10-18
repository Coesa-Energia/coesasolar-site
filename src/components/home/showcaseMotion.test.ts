import { describe, expect, it } from "vitest";
import { showcaseOffset, showcaseProgress } from "./showcaseMotion";

describe("rolagem horizontal das vitrines", () => {
  it("move o app para a esquerda e o portal para a direita", () => {
    const distance = 960;
    expect(showcaseOffset("left", showcaseProgress(0.05), distance)).toBeCloseTo(0);
    expect(showcaseOffset("left", showcaseProgress(0.95), distance)).toBeCloseTo(-distance);
    expect(showcaseOffset("right", showcaseProgress(0.05), distance)).toBeCloseTo(-distance);
    expect(showcaseOffset("right", showcaseProgress(0.95), distance)).toBeCloseTo(0);
  });
});
