"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Pause, Play } from "lucide-react";
import { solarEnergyMwh, solarMinuteAtX, solarPowerKw } from "@/lib/solar-day";

const presets = [
  { label: "Amanhecer", minute: 6 * 60 + 30 },
  { label: "Meio-dia", minute: 12 * 60 },
  { label: "Entardecer", minute: 17 * 60 },
  { label: "Noite", minute: 19 * 60 },
];

function formatTime(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function SolarDaySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [minute, setMinute] = useState(7 * 60 + 10);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
    }
    if (!sectionRef.current || !window.IntersectionObserver) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const timer = window.setInterval(() => setMinute((current) => current >= 19 * 60 ? 6 * 60 : current + 5), 750);
    return () => window.clearInterval(timer);
  }, [playing, inView]);

  function moveSun(event: PointerEvent<HTMLDivElement>) {
    const arc = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!arc) return;
    setPlaying(false);
    setMinute(solarMinuteAtX(event.clientX, arc.left, arc.width));
  }

  const progress = Math.min(1, Math.max(0, (minute - 6 * 60) / (12 * 60)));
  const sunX = 80 + progress * 840;
  const sunY = 240 - 680 * progress * (1 - progress);
  const sky = minute < 8 * 60
    ? "linear-gradient(110deg, #145f5b 0%, #78aa64 48%, #f7bc64 100%)"
    : minute < 16 * 60
      ? "linear-gradient(110deg, #117b65 0%, #a6bd55 48%, #ffc064 100%)"
      : minute < 18 * 60 + 30
        ? "linear-gradient(110deg, #165f58 0%, #b5a251 44%, #ed8744 100%)"
        : "linear-gradient(110deg, #102d3a 0%, #24475a 52%, #635a59 100%)";

  return (
    <section ref={sectionRef} id="dia-de-sol" aria-labelledby="dia-de-sol-titulo" className="scroll-mt-20 bg-[#f7f0e3] text-[#172019]">
      <div className="mx-auto flex max-w-[1600px] flex-col justify-center px-5 py-6 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:px-14 lg:py-7 xl:px-20">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#526b55]">13 · Energia em movimento</p>
            <h2 id="dia-de-sol-titulo" className="mt-4 text-[clamp(2.8rem,5.2vw,6rem)] font-medium leading-[0.94] tracking-[-0.07em]">
              Um dia de <span className="text-[#3b6948]">sol.</span>
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-[#596259] sm:text-base">
            Acompanhe a geração ilustrativa de uma usina parceira de 1 MWp. Arraste o sol pela curva: a energia entra na rede e se transforma em créditos na sua conta.
          </p>
        </div>

        <div className="relative mt-5 h-[470px] overflow-hidden rounded-[1.5rem] text-[#f8f5eb] sm:h-[530px] lg:mt-7 lg:h-[450px]" style={{ backgroundImage: sky }}>
          <div className="absolute inset-x-0 top-0 h-2/3 opacity-40 [background-image:radial-gradient(circle_at_73%_45%,#fff5ad_0%,transparent_32%)]" />
          <div className="absolute inset-x-[4%] top-[3%] h-[53%] w-[92%]" aria-hidden="true">
            <svg className="h-full w-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <path d="M80 240 Q500 -100 920 240" fill="none" stroke="white" strokeDasharray="4 11" strokeOpacity="0.55" strokeWidth="1.3" />
            </svg>
            {minute <= 18 * 60 && (
              <div
                title="Arraste o sol pela curva"
                className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing"
                style={{ left: `${sunX / 10}%`, top: `${sunY / 3}%` }}
                onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); moveSun(event); }}
                onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveSun(event); }}
                onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
                onPointerCancel={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
              >
                <span className="h-9 w-9 rounded-full bg-[#fffdf0] shadow-[0_0_0_22px_rgba(255,245,180,0.2),0_0_46px_24px_rgba(255,245,180,0.45)] sm:h-11 sm:w-11" />
              </div>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-[29%] h-[17%] bg-[#608555]/50 [clip-path:polygon(0_80%,23%_68%,50%_78%,76%_45%,100%_50%,100%_100%,0_100%)]" />
          <div className="absolute inset-x-0 bottom-[20%] h-[19%] bg-[#315c47]/70 [clip-path:polygon(0_55%,25%_70%,49%_52%,72%_72%,100%_35%,100%_100%,0_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[39%] bg-gradient-to-t from-[#0c2a24] via-[#123c31]/95 to-[#123c31]/10" />

          <div className="pointer-events-none relative flex h-full flex-col justify-between p-5 sm:p-8 lg:p-9">
            <div className="flex items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80">
              <span>Usina parceira · 1 MWp</span>
              <span>Valores ilustrativos</span>
            </div>

            <div className="pointer-events-auto">
              <div className="grid gap-4 sm:grid-cols-[1.25fr_1fr_1fr] sm:items-end sm:gap-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">Horário</p>
                  <output htmlFor="horario-solar" className="mt-1 block text-[clamp(4rem,7vw,7rem)] font-medium leading-none tracking-[-0.08em]">{formatTime(minute)}</output>
                </div>
                <div>
                  <p className="text-xs text-white/70">A usina gera agora</p>
                  <strong className="mt-1 block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{Math.round(solarPowerKw(minute))} <span className="text-base font-normal">kW</span></strong>
                </div>
                <div>
                  <p className="text-xs text-white/70">No dia até aqui</p>
                  <strong className="mt-1 block text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{solarEnergyMwh(minute).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-base font-normal">MWh</span></strong>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[2.5rem_1fr] gap-2 border-t border-white/25 pt-4 sm:flex sm:flex-nowrap sm:items-center">
                <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pausar passagem do sol" : "Reproduzir passagem do sol"} className="order-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#09261f] text-white transition hover:bg-[#174638] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:order-1">
                  {playing ? <Pause aria-hidden="true" className="h-4 w-4" /> : <Play aria-hidden="true" className="h-4 w-4" />}
                </button>
                <div className="order-1 col-span-2 grid grid-cols-2 gap-1 rounded-lg bg-[#09261f] p-1 sm:order-2 sm:flex sm:flex-none">
                  {presets.map((preset) => (
                    <button key={preset.label} type="button" aria-pressed={minute === preset.minute} onClick={() => { setPlaying(false); setMinute(preset.minute); }} className="whitespace-nowrap rounded-md px-2.5 py-2 text-xs text-white/75 transition hover:bg-white/10 hover:text-white aria-pressed:bg-white/15 aria-pressed:text-white">
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input id="horario-solar" aria-label="Horário do sol" aria-valuetext={formatTime(minute)} type="range" min={6 * 60} max={19 * 60} step="5" value={minute} onChange={(event) => { setPlaying(false); setMinute(Number(event.target.value)); }} className="order-3 h-8 min-w-0 w-full cursor-pointer accent-[#f6b847] sm:flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
