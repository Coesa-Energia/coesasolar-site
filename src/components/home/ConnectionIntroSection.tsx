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
      <div className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-14 lg:py-36 xl:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#667663]">A energia, sem complicação</p>
          <h2 className="mt-5 text-[clamp(2.7rem,5vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.07em]">Quem gera e quem usa,<br />no mesmo lugar.</h2>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-[#586057] sm:text-lg">A energia tradicional ainda roda em telefone, planilha e PDF. A COESA conecta usinas e clientes numa experiência só, enquanto a distribuidora continua cuidando dos fios.</p>
        </div>

        <div className="mt-20 grid border-y border-[#c9c9bb] md:grid-cols-3">
          {benefits.map(({ title, text, icon: Icon }, index) => (
            <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: index * 0.08 }} className="border-[#c9c9bb] py-8 md:border-r md:px-8 md:py-9 first:md:pl-0 last:border-0 last:md:pr-0">
              <Icon className="h-5 w-5 text-[#52705a]" strokeWidth={1.5} />
              <h3 className="mt-8 text-2xl font-medium tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-[#62685f]">{text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 grid gap-8 border-t border-[#c9c9bb] pt-7 sm:grid-cols-2">
          <div><strong className="block text-4xl font-medium tracking-[-0.06em]">+2.000</strong><span className="mt-1 block text-sm text-[#62685f]">clientes COESA</span></div>
          <div><strong className="block text-4xl font-medium tracking-[-0.06em]">Uma cidade</strong><span className="mt-1 block text-sm text-[#62685f]">energia suficiente para atender uma cidade de pequeno porte</span></div>
        </div>
      </div>
    </section>
  );
}
