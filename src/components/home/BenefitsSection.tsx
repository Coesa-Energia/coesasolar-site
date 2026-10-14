"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount";

const benefits = [
  { number: "01", title: `${PUBLIC_DISCOUNT_LABEL} de desconto`, detail: "Economia visível na conta de luz, mês após mês." },
  { number: "02", title: "Sem instalar painéis", detail: "Nada de obras ou mudanças na sua casa." },
  { number: "03", title: "Sem investimento inicial", detail: "Você não precisa comprar equipamentos." },
  { number: "04", title: "Adesão digital", detail: "Comece a conversa de onde estiver." },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" aria-labelledby="beneficios-titulo" className="bg-[#e9ece3] text-[#172019]">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-5 py-20 sm:px-8 lg:min-h-screen lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20 lg:px-14 lg:py-28 xl:px-20">
        <motion.div
          initial={{ x: -30 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#526b55]">03 · Simplicidade</p>
          <h2 id="beneficios-titulo" className="mt-5 max-w-3xl text-[clamp(3.2rem,5.8vw,6.8rem)] font-medium leading-[0.92] tracking-[-0.075em]">
            Economize sem <span className="text-[#3b6948]">complicação.</span>
          </h2>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-[#566359] sm:text-lg">
            Energia solar por assinatura para reduzir sua conta de luz em {PUBLIC_DISCOUNT_LABEL}. Sem placas no telhado, sem obras e sem investimento inicial.
          </p>

          <div className="mt-10 grid border-t border-[#bdc9bc] sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.number} className="min-h-32 border-b border-[#bdc9bc] py-5 sm:pr-6">
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#62846a]">{benefit.number}</span>
                <h3 className="mt-3 text-xl font-medium tracking-[-0.035em]">{benefit.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#657267]">{benefit.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 30 }}
          whileInView={{ x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative overflow-hidden rounded-[2rem] bg-[#203b2b] px-7 py-8 text-[#f4f1e8] sm:px-10 sm:py-11 lg:px-12 lg:py-14"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/10 shadow-[0_0_0_50px_rgba(255,255,255,0.035),0_0_0_100px_rgba(255,255,255,0.025)]" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-white/20 pb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a6cbb0]">Comece pela sua conta</span>
              <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-[#a6cbb0]" />
            </div>
            <p className="mt-10 max-w-md text-3xl font-medium leading-[1.1] tracking-[-0.055em] sm:text-4xl">Sua economia começa com uma simulação simples.</p>
            <div className="mt-11 border-y border-white/20 py-7">
              <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-[#a6cbb0]">Desconto COESA</span>
              <strong className="mt-2 block text-[clamp(5rem,10vw,8rem)] font-medium leading-none tracking-[-0.09em]">{PUBLIC_DISCOUNT_LABEL}</strong>
              <p className="mt-3 text-sm text-white/60">na conta de luz, sem instalar nada</p>
            </div>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-white/70">Informe sua distribuidora e o valor médio da fatura. A COESA continua a conversa pelo WhatsApp.</p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("coesa:open-lead-form"))}
              className="group mt-7 flex w-full items-center justify-between rounded-full bg-[#e9ece3] px-6 py-4 text-sm font-medium text-[#203b2b] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9e6c3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#203b2b]"
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
