"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { showcaseOffset, showcaseProgress, type ShowcaseDirection } from "./showcaseMotion";

type Props = {
  titleId: string;
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  intro: ReactNode;
  labels: readonly string[];
  cards: ReactNode[];
  direction: ShowcaseDirection;
  tone?: "light" | "dark";
};

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

// Geometry and scroll mapping adapted from Gridora's numbered 05-solutions section:
// sticky viewport, --pipeline-distance = 1.15 * overflow, progress in [.05, .95].
export function GridoraShowcaseRail({ titleId, eyebrow, title, subtitle, intro, labels, cards, direction, tone = "light" }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const distance = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const travel = useTransform(scrollYProgress, showcaseProgress);
  const x = useTransform(() => showcaseOffset(direction, travel.get(), distance.get()));
  const fill = useTransform(travel, (value) => `${value * 100}%`);
  const reverseFill = useTransform(travel, (value) => `${(1 - value) * 100}%`);
  const isDark = tone === "dark";

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;
    const measure = () => {
      const overflow = Math.max(track.offsetWidth - viewport.clientWidth, 0);
      distance.set(overflow);
      section.style.setProperty("--pipeline-distance", `${Math.round(1.15 * overflow)}px`);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [distance, cards.length]);

  const jumpTo = (index: number) => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track || distance.get() <= 0) return;
    const card = track.querySelectorAll<HTMLElement>("[data-stage]")[index];
    if (!card) return;
    const center = card.offsetLeft + card.offsetWidth / 2 - viewport.clientWidth / 2;
    const progress = direction === "left" ? clamp(center / distance.get()) : clamp(1 - center / distance.get());
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (0.05 + 0.9 * progress) * (section.offsetHeight - window.innerHeight) });
  };

  return <section ref={sectionRef} aria-labelledby={titleId} className={`${isDark ? "bg-[#f5f6f2]" : "bg-[#f5efe3]"} relative scroll-mt-20 py-16 lg:h-[calc(100svh_+_var(--pipeline-distance,_260svh))] lg:py-0 motion-reduce:!h-auto`}>
    <div className={`lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:overflow-hidden lg:pb-8 lg:pt-28 motion-reduce:!static motion-reduce:!h-auto motion-reduce:!overflow-visible`}>
      <div className="mx-auto w-full max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[#59675b] ring-1 ring-black/5"><span className="size-1.5 rounded-full bg-[#27824a]" />{eyebrow}</p><h2 id={titleId} className="mt-4 text-[clamp(2.2rem,3vw,3.5rem)] font-light leading-[1.07] tracking-[-0.055em] text-[#17231c]">{title}<span className="block text-[#949c93]">{subtitle}</span></h2></div>
          <div aria-hidden="true" className={`relative hidden w-full max-w-sm shrink-0 pb-1 lg:block`}><div className="absolute inset-x-[7px] top-[7px] h-px bg-[#17231c]/15"><motion.span className={`absolute inset-y-0 w-full bg-gradient-to-r from-[#65c76a] to-[#27824a] ${direction === "right" ? "right-0 origin-right" : "left-0 origin-left"}`} style={reducedMotion ? { scaleX: 1 } : { scaleX: travel }} /><motion.span className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#65c76a] shadow-[0_0_12px_2px_rgba(87,199,106,0.65)]" style={reducedMotion ? { left: "100%" } : { left: direction === "left" ? fill : reverseFill }} /></div><ol className="relative flex justify-between">{(direction === "right" ? [...labels].reverse() : labels).map((label, index) => <li key={label} className="flex flex-col items-center gap-1.5"><span className="size-3.5 rounded-full border border-[#b9c8bb] bg-[#f5efe3]" /><span className="mt-2 text-sm font-medium text-[#17231c]">{label}</span><span className="text-xs text-[#7a8a7e]">0{direction === "right" ? labels.length - index : index + 1} / 0{labels.length}</span></li>)}</ol></div>
        </div>
      </div>
      <div ref={viewportRef} className={`mt-9 min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-clip`} onFocusCapture={(event) => { const card = (event.target as HTMLElement).closest("[data-stage]"); if (card) jumpTo(Number(card.getAttribute("data-stage"))); }}>
        <motion.div ref={trackRef} data-showcase-track={direction} style={reducedMotion ? undefined : { x }} className={`mx-auto flex max-w-7xl flex-col gap-4 px-5 lg:px-8 lg:mx-0 lg:h-full lg:w-max lg:max-w-none lg:flex-row lg:gap-6 lg:px-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))] ${direction === "right" ? `lg:flex-row-reverse` : ""} motion-reduce:!mx-auto motion-reduce:!w-full motion-reduce:!max-w-7xl motion-reduce:!flex-col motion-reduce:!transform-none`}>
          <div className={`max-w-xl pb-4 text-[#667369] lg:flex lg:w-[21rem] lg:max-w-none lg:shrink-0 lg:flex-col lg:justify-between lg:py-2`}>{intro}<p aria-hidden="true" className={`mt-8 hidden items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] lg:flex`}>Role para acompanhar <span className="h-px w-12 bg-[#27824a]" /></p></div>
          {cards.map((card, index) => <article key={index} data-stage={index} className={`relative isolate overflow-hidden rounded-[2rem] lg:h-full lg:w-[min(72vw,56rem)] lg:shrink-0 ${isDark ? "bg-[#173c2e] text-white" : "bg-white text-[#17231c] ring-1 ring-inset ring-black/5"}`}>{card}</article>)}
        </motion.div>
      </div>
    </div>
  </section>;
}
