"use client";

import { motion } from "framer-motion";
import { Smartphone, WalletCards, Wrench } from "lucide-react";

const benefits = [
  {
    title: "Sem obra",
    text: "Nada de placa no telhado, visita técnica ou troca de medidor.",
    icon: Wrench,
  },
  {
    title: "Adesão R$ 0",
    text: "Sem fidelidade com multa. Saiu, a conta volta a ser só da distribuidora.",
    icon: WalletCards,
  },
  {
    title: "Tudo no app",
    text: "A assistente responde no WhatsApp, gera o PIX e mostra a economia de cada mês.",
    icon: Smartphone,
  },
];

export function ConnectionIntroSection() {
  return (
    <section id="conexao" className="relative overflow-hidden bg-[#eee8da] text-[#151913]">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-center px-5 py-10 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:px-14 lg:py-8 xl:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#667663]">A energia, sem complicação</p>
          <h2 className="mt-4 text-[clamp(2.4rem,4.6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.07em]">Quem gera e quem usa,<br />no mesmo lugar.</h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-[#586057] sm:text-base">A energia tradicional ainda roda em telefone, planilha e PDF. A COESA conecta usinas e clientes numa experiência só, enquanto a distribuidora continua cuidando dos fios.</p>
        </div>

        <div className="mt-6 grid border-y border-[#c9c9bb] md:grid-cols-3 lg:mt-8">
          {benefits.map(({ title, text, icon: Icon }, index) => (
            <motion.article key={title} initial={{ y: 18 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: index * 0.08 }} className="grid grid-cols-[24px_1fr] gap-x-3 border-b border-[#c9c9bb] py-3 md:block md:border-b-0 md:border-r md:px-8 md:py-5 first:md:pl-0 last:border-0 last:md:pr-0">
              <Icon className="row-span-2 h-5 w-5 text-[#52705a]" strokeWidth={1.5} />
              <h3 className="text-lg font-medium tracking-[-0.04em] md:mt-4 md:text-xl">{title}</h3>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#62685f] md:mt-2 md:text-sm">{text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5 border-t border-[#c9c9bb] pt-4 lg:mt-8 lg:pt-5">
          <div><strong className="block text-2xl font-medium tracking-[-0.06em] sm:text-3xl">+2.000</strong><span className="mt-1 block text-xs text-[#62685f] sm:text-sm">clientes COESA</span></div>
          <div><strong className="block text-2xl font-medium tracking-[-0.06em] sm:text-3xl">Uma cidade</strong><span className="mt-1 block text-xs text-[#62685f] sm:text-sm">energia suficiente para atender uma cidade de pequeno porte</span></div>
        </div>
      </div>
    </section>
  );
}
