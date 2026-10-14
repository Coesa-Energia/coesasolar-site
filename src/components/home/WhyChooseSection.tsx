import { motion } from "framer-motion";
import { ArrowDownRight, FileCheck2, HeartHandshake, ReceiptText } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsive-image";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";

const reasons = [
  {
    icon: FileCheck2,
    title: "Contrato claro",
    description: "Condições de desconto explicadas antes da assinatura.",
  },
  {
    icon: ReceiptText,
    title: "Economia acompanhada",
    description: "O desconto aplicado aparece mês a mês na sua conta.",
  },
  {
    icon: HeartHandshake,
    title: "Atendimento próximo",
    description: "Uma equipe acompanha você da simulação à adesão.",
  },
];

export function WhyChooseSection() {
  const { configs } = useConfiguracoes();

  return (
    <section id="por-que-coesa" aria-labelledby="por-que-coesa-titulo" className="relative isolate overflow-hidden bg-[#101c16] text-[#f4f1e8]">
      <div className="absolute inset-0 -z-10">
        <img
          {...responsiveImageProps(configs.home_bg_why_choose, "100vw")}
          loading="lazy"
          decoding="async"
          alt=""
          className="h-full w-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101c16] via-[#101c16]/90 to-[#101c16]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101c16] via-transparent to-[#101c16]/30" />
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col justify-center gap-7 px-5 py-8 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:gap-8 lg:px-14 lg:py-7 xl:px-20">
        <motion.div
          initial={{ y: 30 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a9cfb0]">04 · Por que COESA</p>
          <h2 id="por-que-coesa-titulo" className="mt-4 max-w-3xl text-[clamp(2.7rem,5.2vw,6rem)] font-medium leading-[0.92] tracking-[-0.075em]">
            Proteção contra <span className="text-[#a7cbaa]">aumentos de tarifa.</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            A tarifa de energia pode mudar. Na COESA, você acompanha o desconto contratado na sua conta e tem uma equipe para entender cada etapa.
          </p>
          <a href="#calculadora" className="group mt-5 inline-flex items-center gap-3 rounded-full border border-white/50 px-5 py-3 text-sm font-medium transition hover:border-white hover:bg-white hover:text-[#172019] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9cfb0]">
            Ver minha economia
            <ArrowDownRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>
        </motion.div>

        <div className="grid border-t border-white/30 bg-[#101c16]/45 backdrop-blur-sm sm:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="flex gap-4 border-b border-white/20 py-3 sm:block sm:border-b-0 sm:pr-8 lg:py-5">
              <reason.icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#a9cfb0] sm:mb-3" strokeWidth={1.5} />
              <div>
                <h3 className="text-base font-medium tracking-[-0.03em]">{reason.title}</h3>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-white/65 sm:text-sm">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
