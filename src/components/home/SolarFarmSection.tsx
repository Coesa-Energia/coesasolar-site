"use client";

import { useEffect, useRef, useState } from "react";

export function SolarFarmSection() {
  const [html, setHtml] = useState("");
  const [failed, setFailed] = useState(false);
  const [height, setHeight] = useState(1);
  const observer = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/interactive/usina-solar-coesa.html", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Usina solar: HTTP ${response.status}`);
        return response.text();
      })
      .then(setHtml)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
      });
    return () => {
      controller.abort();
      observer.current?.disconnect();
    };
  }, []);

  function fitFrame(frame: HTMLIFrameElement) {
    observer.current?.disconnect();
    const document = frame.contentDocument;
    if (!document) return;
    const resize = () => setHeight(document.documentElement.scrollHeight);
    resize();
    observer.current = new ResizeObserver(resize);
    observer.current.observe(document.body);
  }

  return (
    <section id="usina-solar" aria-labelledby="usina-solar-titulo" className="scroll-mt-20 bg-[#f4efe3] text-[#17251b] lg:min-h-[calc(100svh-80px)]">
      <div className="mx-auto max-w-[1600px] px-5 pb-4 pt-8 sm:px-8 lg:px-14 lg:pb-3 lg:pt-5 xl:px-20">
        <div className="grid items-end gap-3 lg:grid-cols-[1.4fr_0.6fr] lg:gap-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#617b64]">08 · Da usina à sua conta</p>
            <h2 id="usina-solar-titulo" className="mt-2 text-[clamp(2.6rem,3.6vw,4rem)] font-medium leading-[0.94] tracking-[-0.07em]">
              Uma fazenda de sol.<br /><span className="text-[#467653]">Energia para muitos.</span>
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-[#596259] sm:text-base">
            A usina parceira gera energia. Ela entra na rede da distribuidora, e os créditos são compensados na sua conta. Explore cada etapa no diagrama.
          </p>
        </div>
      </div>
      {failed ? (
        <p className="mx-auto max-w-[1600px] px-5 pb-12 sm:px-8 lg:px-14 xl:px-20">
          O diagrama não carregou. <a className="underline" href="/interactive/usina-solar-coesa.html">Abrir a usina interativa</a>.
        </p>
      ) : html ? (
        <iframe
          title="Diagrama interativo da usina solar COESA"
          srcDoc={html}
          onLoad={(event) => fitFrame(event.currentTarget)}
          className="block w-full border-0"
          style={{ height, visibility: height === 1 ? "hidden" : "visible" }}
        />
      ) : (
        <p className="mx-auto max-w-[1600px] px-5 pb-12 text-sm text-[#596259] sm:px-8 lg:px-14 xl:px-20">Carregando usina interativa…</p>
      )}
    </section>
  );
}
