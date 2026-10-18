import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => {
  const query = { select: () => query, eq: () => query, then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve) };
  return { supabase: { from: () => query } };
});
vi.mock("next/script", () => ({ default: ({ src }: { src: string }) => <span data-testid="footer-seal-script" data-src={src} /> }));

import { HomeFooter } from "./HomeFooter";

afterEach(() => vi.unstubAllGlobals());

it("carrega o selo externo quando o rodapé se aproxima da tela", () => {
  let reveal: IntersectionObserverCallback | undefined;
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { reveal = callback; }
    observe() {}
    disconnect() {}
  });

  render(<HomeFooter />);
  expect(screen.queryByTestId("footer-seal-script")).not.toBeInTheDocument();
  act(() => reveal?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
  expect(screen.getByTestId("footer-seal-script")).toHaveAttribute("data-src", "https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js");
});
