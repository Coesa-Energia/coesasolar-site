import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SolarFarmSection } from "./SolarFarmSection";

afterEach(() => vi.unstubAllGlobals());

describe("usina solar na home", () => {
  it("entra depois de Como funciona e mantém Um dia de sol antes da imprensa", () => {
    const home = readFileSync("src/screens/Index.tsx", "utf8");
    expect(home).toMatch(/<HowItWorksSection\s*\/>\s*<DeferredHomeSection section="usina"\s*\/>/);
    expect(home).toMatch(/<DeferredHomeSection section="simulacao"\s*\/>\s*<SolarDaySection\s*\/>\s*<PressSection\s*\/>/);
    expect(home).not.toContain("<AboutSection />");
  });

  it("inclui o diagrama e os controles interativos do HTML original", () => {
    const html = readFileSync("public/interactive/usina-solar-coesa.html", "utf8");
    expect(html).toContain('class="iso-stage farm-stage"');
    expect(html).toContain('id="hour" type="range"');
    expect(html).toContain('data-route="grid"');
    expect(html).not.toContain('class="presets"');
    expect(html).not.toContain('class="iso-legend"');
    expect(html).not.toContain('class="qualification"');
    expect(html).not.toContain('class="site-header"');
  });

  it("muda iluminação e direção das sombras ao mover o horário", () => {
    const html = readFileSync("public/interactive/usina-solar-coesa.html", "utf8");
    const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
    expect(script).toBeTruthy();
    const properties = new Map<string, string>();
    const listeners = new Map<string, () => void>();
    const element = () => ({ textContent: "", style: { opacity: "", setProperty: (name: string, value: string) => properties.set(name, value) }, setAttribute: () => {}, addEventListener: (event: string, listener: () => void) => listeners.set(event, listener) });
    const slider = { ...element(), value: "720" };
    const nodes = new Map([["#hour", slider], ...["[data-time]", "[data-power]", "[data-energy]", "[data-readout]", "[data-sun]", ".farm-stage", ".iso-plate"].map((selector) => [selector, element()] as const)]);
    runInNewContext(script, {
      document: { querySelector: (selector: string) => nodes.get(selector), querySelectorAll: () => [] },
      matchMedia: () => ({ matches: true }),
      IntersectionObserver: class { observe() {} },
    });
    const at = (minute: number) => { slider.value = String(minute); listeners.get("input")?.(); return Object.fromEntries(properties); };
    const dawn = at(390);
    const noon = at(720);
    const dusk = at(1020);
    const night = at(1080);
    expect(Number(noon["--image-brightness"])).toBeGreaterThan(Number(dawn["--image-brightness"]));
    expect(Number(noon["--image-brightness"])).toBeGreaterThan(Number(dusk["--image-brightness"]));
    expect(Number.parseFloat(dawn["--shadow-x"])).toBeGreaterThan(0);
    expect(Number.parseFloat(dusk["--shadow-x"])).toBeLessThan(0);
    expect(night["--shadow-opacity"]).toBe("0");
  });

  it("carrega o HTML em um frame com nome acessível", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "<p>Usina</p>" }));
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    render(<SolarFarmSection />);
    const frame = await screen.findByTitle("Diagrama interativo da usina solar COESA");
    expect(frame).toHaveAttribute("srcdoc", "<p>Usina</p>");
    expect(fetch).toHaveBeenCalledWith("/interactive/usina-solar-coesa.html", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("adia o diagrama até a seção se aproximar da tela", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "<p>Usina</p>" });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
    let reveal: IntersectionObserverCallback | undefined;
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { reveal = callback; }
      observe() {}
      disconnect() {}
    });

    render(<SolarFarmSection />);
    expect(fetchMock).not.toHaveBeenCalled();
    act(() => reveal?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(await screen.findByTitle("Diagrama interativo da usina solar COESA")).toHaveAttribute("srcdoc", "<p>Usina</p>");
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
