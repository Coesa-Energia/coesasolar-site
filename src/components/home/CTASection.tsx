"use client";

import { openLeadForm } from "@/lib/lead-funnel";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsive-image";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { WHATSAPP_5192 } from "@/lib/whatsapp-numbers";

export function CTASection() {
  const { configs } = useConfiguracoes();
  const whatsappUrl = `https://wa.me/${WHATSAPP_5192}?text=Olá! Vim pelo site e quero começar a economizar na conta de luz.`;

  return (
    <section aria-labelledby="cta-titulo" className="relative isolate overflow-hidden bg-[#10251d] text-[#f5f0e5]">
      <div className="absolute inset-0 -z-10">
        <img {...responsiveImageProps(configs.home_bg_cta, "100vw")} loading="lazy" decoding="async" alt="" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10251d] via-[#10251d]/90 to-[#10251d]/55" />
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-col justify-center px-5 py-20 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:px-14 lg:py-12 xl:px-20">
        <motion.div initial={{ y: 24 }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a9cfb0]">17 · Próximo passo</p>
          <h2 id="cta-titulo" className="mt-6 max-w-5xl text-[clamp(3.6rem,8vw,9rem)] font-medium leading-[0.91] tracking-[-0.08em]">Sua próxima conta<br />pode ser <span className="text-[#a9cfb0]">menor.</span></h2>
          <div className="mt-12 flex flex-col gap-8 border-t border-white/25 pt-7 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-md text-base leading-relaxed text-white/70 sm:text-lg">Comece com o valor médio da sua conta. A COESA entra em contato para continuar a simulação.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => openLeadForm("final_cta")} className="inline-flex min-h-14 items-center justify-between gap-8 rounded-full bg-[#f5f0e5] px-6 py-4 text-sm font-medium text-[#203b2b] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9cfb0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10251d]">Começar minha simulação <ArrowUpRight className="h-5 w-5" aria-hidden="true" /></button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-between gap-8 rounded-full border border-white/45 px-6 py-4 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9cfb0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10251d]">Falar com a COESA <ArrowUpRight className="h-5 w-5" aria-hidden="true" /></a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
