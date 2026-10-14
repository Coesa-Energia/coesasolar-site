"use client";

import { openLeadForm } from "@/lib/lead-funnel";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { DottedSurface } from "./DottedSurface";
import { ProgressiveFluxBar } from "./ProgressiveFluxBar";

const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function PredictableBillSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.round(value * 100) / 100;
    setProgress((current) => current === next ? current : next);
  });

  return <div id="conta-previsivel" ref={sectionRef} className="relative bg-[#f4eddf] text-[#171714] lg:h-[240vh] [@media(max-height:740px)]:h-auto">
    <section aria-label="Previsibilidade na conta" className="relative lg:sticky lg:top-20 lg:flex lg:h-[calc(100svh-80px)] lg:flex-col lg:overflow-hidden [@media(max-height:740px)]:static [@media(max-height:740px)]:h-auto [@media(max-height:740px)]:overflow-visible">
      <div className="relative h-24 shrink-0 overflow-hidden border-b border-[#d5cbb7] opacity-90 lg:h-[clamp(120px,18vh,220px)] [background-image:linear-gradient(rgba(33,47,37,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(33,47,37,0.06)_1px,transparent_1px)] [background-size:72px_72px]">
        <DottedSurface size={8} opacity={0.82} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-0 max-w-[1600px] flex-col justify-end px-5 py-4 sm:px-8 lg:flex-1 lg:px-14 lg:pb-10 xl:px-20">
        <div className="grid items-end gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <motion.div initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 0.7 }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#536357]">02 · Previsibilidade</p>
            <h2 className="mt-3 max-w-3xl font-medium leading-[0.9] tracking-[-0.075em] lg:mt-5"><span className="block text-[clamp(2.7rem,5.7vw,6.6rem)]">Previsibilidade nos custos.</span><span className="mt-2 block text-[clamp(1.8rem,3.8vw,4.4rem)] text-[#345d3f] lg:mt-4">Seu consumo varia. Seu desconto, não!</span></h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#51534c] sm:text-lg lg:mt-7">A conta varia conforme o que você usa. A COESA acompanha o consumo e mantém a economia visível todos os meses.</p>
          </motion.div>
          <div className="rounded-[2rem] border border-[#d5cbb7] bg-[#eee5d3]/80 p-4 backdrop-blur-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-[#d5cbb7] pb-5"><span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#657367]">Sua conta, mês a mês</span><span className="text-sm text-[#657367]">{months[Math.min(months.length - 1, Math.floor(progress * months.length))]}</span></div>
            <div className="mt-4 flex items-end justify-between gap-5 lg:mt-8"><div><span className="block text-sm text-[#657367]">Desconto aplicado</span><strong className="mt-1 block text-5xl font-medium tracking-[-0.07em] text-[#345d3f]">20%</strong></div><div className="text-right"><span className="block text-sm text-[#657367]">Valor mínimo da fatura</span><strong className="mt-1 block text-4xl font-medium tracking-[-0.07em]">R$ 350</strong></div></div>
            <div className="mt-4 lg:mt-8"><div className="mb-2 flex justify-between text-xs text-[#657367]"><span>Distribuidora</span><span>COESA</span></div><ProgressiveFluxBar scrollProgress={scrollYProgress} /></div>
            <button type="button" onClick={() => openLeadForm("predictable_bill")} className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1d271f] transition hover:text-[#345d3f] lg:mt-8">Calcular minha economia <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></button>
          </div>
        </div>
        <div className="mt-3 border-t border-[#d5cbb7] pt-3 text-xs text-[#697066] lg:mt-8 lg:pt-4">O consumo varia. O desconto continua.</div>
      </div>
    </section>
  </div>;
}
