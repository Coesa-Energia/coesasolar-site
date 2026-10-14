import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { WHATSAPP_5192 } from "@/lib/whatsapp-numbers";
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount";

const features = [
  "Energia 100% solar",
  "Sem taxa de adesão",
  "Contrato digital",
  "Atendimento prioritário",
  "Sem obras ou instalação de painéis",
  "Sem investimento inicial",
];

export function PlansSection() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_5192}?text=${encodeURIComponent(`Olá! Vim pelo site e gostaria de contratar o plano com ${PUBLIC_DISCOUNT_LABEL} de desconto.`)}`;

  return (
    <section id="planos" aria-labelledby="planos-titulo" className="scroll-mt-20 bg-[#e9ece3] text-[#172019]">
      <div className="mx-auto flex max-w-[1600px] flex-col justify-center px-5 py-8 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:px-14 lg:py-12 xl:px-20">
        <motion.div
          initial={{ y: 24 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#526b55]">06 · Plano COESA</p>
          <h2 id="planos-titulo" className="mt-3 max-w-5xl text-[clamp(2.7rem,5.7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.075em] sm:mt-5">
            Desconto <span className="text-[#3b6948]">transparente:</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#566359] sm:mt-5 sm:text-lg">
            Uma condição simples para quem consome de 300 a 1.000 kWh/mês.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 28 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 grid border-t border-[#aebfac] pt-4 lg:mt-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pt-10"
        >
          <div className="flex flex-col justify-between border-b border-[#aebfac] pb-4 lg:border-b-0 lg:pb-0">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#526b55]">Desconto COESA</p>
              <strong className="mt-2 block text-[clamp(5rem,14vw,12rem)] font-medium leading-[0.85] tracking-[-0.105em] text-[#315e3d]">
                {PUBLIC_DISCOUNT_LABEL}
              </strong>
            </div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-[#566359] sm:mt-6 sm:text-sm">
              O percentual contratado permanece. O valor economizado acompanha seu consumo.
            </p>
          </div>

          <div className="pt-4 lg:pt-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#526b55]">O que está incluído</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 sm:mt-4 sm:gap-x-8">
              {features.map((feature, index) => (
                <li key={feature} className="flex items-start gap-2 border-t border-[#c5d0c3] py-2 text-xs leading-snug sm:min-h-14 sm:gap-4 sm:py-4 sm:text-base">
                  <span aria-hidden="true" className="mt-0.5 font-mono text-[10px] text-[#4d7955]">0{index + 1}</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group mt-3 flex min-h-12 items-center justify-between gap-4 rounded-full bg-[#203b2b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#315e3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e3d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e9ece3] sm:mt-6 sm:min-h-14 sm:px-6 sm:py-4 sm:text-base">
              Contratar com {PUBLIC_DISCOUNT_LABEL} de desconto
              <ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
