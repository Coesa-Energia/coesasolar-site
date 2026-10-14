import { motion } from "framer-motion";
import { responsiveImageProps } from "@/lib/responsive-image";
import { StatsCounter } from "./StatsCounter";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";

const stats = [
  { value: 20, suffix: "+", label: "MWp instalados" },
  { value: 3000, suffix: "+", label: "MWh/mês" },
  { value: 2000, suffix: "+", label: "Clientes" },
  { value: 4, suffix: "", label: "Estados" },
];

export function AboutSection() {
  const { configs } = useConfiguracoes();
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="scroll-mt-20 bg-[#f4efe3] text-[#17251b]">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-14 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-14 lg:py-8 xl:px-20">
        <motion.div initial={{ x: -24 }} whileInView={{ x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative min-w-0">
          <div className="h-[340px] overflow-hidden rounded-[1.5rem] bg-[#244433] sm:h-[460px] lg:h-[540px]">
            <img {...responsiveImageProps(configs.home_bg_about, "(min-width: 1024px) 50vw, 100vw")} loading="lazy" decoding="async" alt="Usina solar COESA" className="h-full w-full object-cover" />
          </div>
          <span className="absolute bottom-5 left-5 rounded-full bg-[#f4efe3] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#244433]">Energia que vem do sol</span>
        </motion.div>
        <motion.div initial={{ x: 24 }} whileInView={{ x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#617b64]">13 · Sobre a COESA</p>
          <h2 id="sobre-titulo" className="mt-5 text-[clamp(3.2rem,5vw,6rem)] font-medium leading-[0.94] tracking-[-0.07em]">Energia com <span className="text-[#467653]">origem.</span><br />Economia com clareza.</h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5c695d] sm:text-lg">A COESA Energia Inteligente é pioneira no modelo de energia solar por assinatura em Minas Gerais. Usinas parceiras geram energia, e você acompanha o desconto na sua conta.</p>
          <div className="mt-9 grid grid-cols-2 border-t border-[#becbbd] sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => <div key={stat.label} className="border-b border-[#becbbd] py-5 pr-3"><p className="text-[clamp(1.8rem,2.4vw,2.8rem)] font-medium leading-none tracking-[-0.06em]"><StatsCounter value={stat.value} suffix={stat.suffix} prefix="" /></p><p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#647669]">{stat.label}</p></div>)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
