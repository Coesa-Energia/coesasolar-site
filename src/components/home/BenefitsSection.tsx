"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount";

const benefits = [
  { number: "01", title: `${PUBLIC_DISCOUNT_LABEL} de desconto`, detail: "Economia na conta, todo mês." },
  { number: "02", title: "Sem instalar painéis", detail: "Sem obras na sua casa." },
  { number: "03", title: "Sem investimento inicial", detail: "Sem comprar equipamentos." },
  { number: "04", title: "Adesão digital", detail: "Comece de onde estiver." },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="bg-[#e9ece3] text-[#172019]">
      <div className="mx-auto grid max-w-[1600px] gap-5 px-5 py-6 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-12 lg:px-14 xl:px-20">
        <motion.div
          initial={{ x: -30 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#526b55]">03 · Simplicidade</p>
          <h2 id="beneficios-titulo" className="mt-3 max-w-3xl text-[clamp(2.5rem,5vw,6rem)] font-medium leading-[0.92] tracking-[-0.075em] sm:mt-4">
            Economize sem <span className="text-[#3b6948]">complicação.</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#566359] sm:mt-5 sm:text-base">
            Energia solar por assinatura para reduzir sua conta de luz em {PUBLIC_DISCOUNT_LABEL}. Sem placas no telhado, sem obras e sem investimento inicial.
          </p>

          <div className="mt-4 grid grid-cols-2 border-t border-[#bdc9bc] sm:mt-6">
            {benefits.map((benefit) => (
              <div key={benefit.number} className="border-b border-[#bdc9bc] py-2 pr-2 sm:py-3 sm:pr-6">
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#62846a]">{benefit.number}</span>
                <h3 className="mt-1 text-sm font-medium tracking-[-0.035em] sm:mt-2 sm:text-lg">{benefit.title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-[#657267] sm:text-sm sm:leading-relaxed">{benefit.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 30 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative overflow-hidden rounded-[1.5rem] bg-[#203b2b] px-5 py-5 text-[#f4f1e8] sm:rounded-[2rem] sm:px-10 sm:py-8"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10 shadow-[0_0_0_50px_rgba(255,255,255,0.035),0_0_0_100px_rgba(255,255,255,0.025)]" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-white/20 pb-3 sm:pb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a6cbb0]">Comece pela sua conta</span>
              <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-[#a6cbb0]" />
            </div>
            <div className="mt-3 border-y border-white/20 py-2 sm:mt-6 sm:py-4">
              <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[#a6cbb0]">Desconto COESA</span>
              <strong className="mt-1 block text-[clamp(3.2rem,8vw,7rem)] font-medium leading-none tracking-[-0.09em]">{PUBLIC_DISCOUNT_LABEL}</strong>
              <p className="mt-1 text-xs text-white/60 sm:mt-3 sm:text-sm">na conta de luz, sem instalar nada</p>
            </div>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/70 sm:mt-5 sm:text-sm">Informe sua distribuidora e o valor médio da fatura. A COESA continua a conversa pelo WhatsApp.</p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("coesa:open-lead-form"))}
              className="group mt-3 flex w-full items-center justify-between rounded-full bg-[#e9ece3] px-5 py-3 text-sm font-medium text-[#203b2b] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9e6c3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#203b2b] sm:mt-5"
            >
              Simular minha economia
              <ArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
