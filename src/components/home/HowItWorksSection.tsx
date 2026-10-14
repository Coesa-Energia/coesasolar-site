import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsive-image";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";

const steps = [
  {
    number: "01",
    title: "Simule",
    description: "Preencha seus dados e valor da conta de luz",
  },
  {
    number: "02",
    title: "Assine",
    description: "Contrato 100% digital, sem burocracia",
  },
  {
    number: "03",
    title: "Conecte",
    description: "Fazemos toda parte técnica com a concessionária",
  },
  {
    number: "04",
    title: "Economize",
    description: "Receba sua fatura com desconto todo mês",
  },
];

export function HowItWorksSection() {
  const { configs } = useConfiguracoes();

  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="relative isolate scroll-mt-20 overflow-hidden bg-[#101c16] text-[#f4f1e8]">
      <div className="absolute inset-0 -z-10">
        <img
          {...responsiveImageProps(configs.home_bg_how_it_works, "100vw")}
          loading="lazy"
          decoding="async"
          alt=""
          className="h-full w-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101c16] via-[#101c16]/90 to-[#101c16]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101c16] via-transparent to-[#101c16]/35" />
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col justify-center px-5 py-8 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:px-14 lg:py-12 xl:px-20">
        <motion.div
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid items-end gap-6 lg:grid-cols-[1fr_0.7fr] lg:gap-16"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a9cfb0]">07 · O processo</p>
            <h2 id="como-funciona-titulo" className="mt-5 max-w-4xl text-[clamp(3.2rem,6vw,7rem)] font-medium leading-[0.92] tracking-[-0.075em]">
              Como <span className="text-[#a9cfb0]">funciona.</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-white/70 sm:text-lg lg:pb-2">
            Da primeira simulação ao desconto na conta. Sem obras, sem painéis e com acompanhamento em cada etapa.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 border-t border-white/30 lg:mt-16 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ y: 24 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="border-b border-white/25 px-2 py-3 lg:min-h-56 lg:border-b-0 lg:border-r lg:px-7 lg:py-7 first:pl-0 last:border-r-0 last:pr-0"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-[#a9cfb0]">{step.number} / 04</span>
              <h3 className="mt-4 text-[clamp(1.5rem,2.5vw,2.5rem)] font-medium tracking-[-0.055em] lg:mt-8">{step.title}</h3>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/65 sm:text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("coesa:open-lead-form"))}
          className="group mt-6 inline-flex min-h-12 items-center justify-between gap-8 self-start rounded-full bg-[#e9ece3] px-6 py-3 text-sm font-medium text-[#203b2b] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9cfb0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101c16] lg:mt-10 lg:min-h-14 lg:py-4"
        >
          Começar minha simulação
          <ArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}
