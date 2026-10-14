import { useMemo } from "react";
import { ChevronDown, DollarSign, MessageCircle, Zap, Leaf, Shield, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount";
import { CompactLeadForm } from "./LeadFormDock";

const ease = [0.23, 1, 0.32, 1] as const;
const iconMap: Record<string, LucideIcon> = { Zap, Leaf, Shield, DollarSign, Clock: DollarSign };

export function HeroSection() {
  const { configs } = useConfiguracoes();
  const stats = useMemo(() => {
    try {
      const parsed = JSON.parse(configs.hero_stats) as Array<{ icon: string; value: string; label: string }>;
      return parsed.map((stat) => ({ ...stat, value: stat.label.toLowerCase() === "economia" ? PUBLIC_DISCOUNT_LABEL : stat.value, Icon: iconMap[stat.icon] || Zap }));
    } catch {
      return [
        { value: PUBLIC_DISCOUNT_LABEL, label: "Economia", Icon: Zap },
        { value: "100%", label: "Energia Limpa", Icon: Leaf },
        { value: "5 anos", label: "Garantia", Icon: Shield },
        { value: "0", label: "Investimento", Icon: DollarSign },
      ];
    }
  }, [configs.hero_stats]);

  const openForm = () => window.dispatchEvent(new Event("coesa:open-lead-form"));
  const scrollToStory = () => document.querySelector("#beneficios")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="inicio" className="relative flex min-h-[760px] flex-col overflow-hidden bg-[#090b09] text-white lg:min-h-screen">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${configs.hero_video_youtube_id}/maxresdefault.jpg)` }}>
        <video autoPlay muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1} className="pointer-events-none absolute inset-0 h-full w-full object-cover">
          <source src="/media/hero-clouds-timelapse.webm?v=3" type="video/webm" />
          <source src="/media/hero-clouds-timelapse.mp4?v=3" type="video/mp4" />
          <img src="/media/hero-clouds-timelapse.gif?v=3" alt="" aria-hidden="true" />
        </video>
        <div className="absolute inset-0 bg-black/42" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(226,216,188,0.08),transparent_28%),linear-gradient(115deg,rgba(8,10,9,0.76)_0%,rgba(8,10,9,0.42)_48%,rgba(8,10,9,0.52)_100%)]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:96px_96px] [mask-image:linear-gradient(to_bottom,transparent,black_32%,black_72%,transparent)]" />

      <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-8 pt-32 sm:px-8 lg:px-14 lg:pb-10 xl:px-20">
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <motion.div initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease }} className="max-w-3xl">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">Energia inteligente</p>
              <h1 className="max-w-3xl text-[clamp(3.2rem,6.2vw,6.8rem)] font-medium leading-[0.9] tracking-[-0.07em] text-white">Energia Solar por Assinatura</h1>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">Economize {PUBLIC_DISCOUNT_LABEL} na sua conta de luz sem investir nada. Energia limpa direto para sua casa.</p>
              <button type="button" onClick={scrollToStory} className="mt-7 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ChevronDown className="h-4 w-4" /> Como funciona</button>
            </motion.div>

            <motion.div initial={{ y: 24 }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.14, ease }} className="lg:justify-self-end lg:max-w-[34rem]">
              <div className="mb-5 max-w-md lg:ml-auto"><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Comece agora</p></div>
              <CompactLeadForm />
              <div className="mt-4 flex items-center justify-between gap-4 text-xs text-white/45 lg:justify-end"><span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-[#6f8b72]" /> Resposta pelo WhatsApp</span><button type="button" onClick={openForm} className="hidden items-center gap-1 text-white/65 transition hover:text-white sm:inline-flex">Prefiro preencher tudo <span aria-hidden="true">↗</span></button></div>
            </motion.div>
          </div>

          <motion.div initial={{ y: 18 }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.34, ease }} className="mt-12 grid border-t border-white/15 pt-5 sm:grid-cols-4">
            {stats.map(({ value, label, Icon }) => <div key={label} className="flex items-center gap-3 border-white/10 py-3 sm:border-r sm:px-5 first:pl-0 last:border-0 last:pr-0"><Icon className="h-4 w-4 shrink-0 text-white/55" strokeWidth={1.5} /><div><strong className="block text-lg font-medium tracking-tight text-white">{value}</strong><span className="text-xs text-white/45">{label}</span></div></div>)}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
