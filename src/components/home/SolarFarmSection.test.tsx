import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SolarFarmSection } from "./SolarFarmSection";

afterEach(() => vi.unstubAllGlobals());

describe("usina solar na home", () => {
  it("entra depois de Como funciona e mantém Um dia de sol antes da imprensa", () => {
    const home = readFileSync("src/screens/Index.tsx", "utf8");
    expect(home).toMatch(/<HowItWorksSection\s*\/>\s*<SolarFarmSection\s*\/>/);
    expect(home).toMatch(/<SimulationSection\s*\/>\s*<SolarDaySection\s*\/>\s*<PressSection\s*\/>/);
    expect(home).not.toContain("<AboutSection />");
  });

  it("inclui o diagrama e os controles interativos do HTML original", () => {
    const html = readFileSync("public/interactive/usina-solar-coesa.html", "utf8");
    expect(html).toContain('class="iso-stage farm-stage"');
    expect(html).toContain('data-preset="720"');
    expect(html).toContain('data-route="grid"');
    expect(html).not.toContain('class="site-header"');
  });

  it("carrega o HTML em um frame com nome acessível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "<p>Usina</p>" }));
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    render(<SolarFarmSection />);
    const frame = await screen.findByTitle("Diagrama interativo da usina solar COESA");
    expect(frame).toHaveAttribute("srcdoc", "<p>Usina</p>");
    expect(fetch).toHaveBeenCalledWith("/interactive/usina-solar-coesa.html", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("reduz o frame à altura real do diagrama compacto", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "<p>Usina</p>" }));
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    render(<SolarFarmSection />);
    const frame = await screen.findByTitle<HTMLIFrameElement>("Diagrama interativo da usina solar COESA");
    Object.defineProperty(frame.contentDocument!.documentElement, "scrollHeight", { configurable: true, value: 592 });
    fireEvent.load(frame);
    expect(frame).toHaveStyle({ height: "592px", visibility: "visible" });
  });

  it("oferece o HTML original quando a carga falha", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<SolarFarmSection />);
    await waitFor(() => expect(screen.getByRole("link", { name: "Abrir a usina interativa" })).toHaveAttribute("href", "/interactive/usina-solar-coesa.html"));
  });
});
