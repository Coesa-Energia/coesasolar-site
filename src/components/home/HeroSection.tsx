import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Clock, Leaf, Moon, Shield, Sun, Zap, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useConfiguracoes } from "@/hooks/useConfiguracoes";
import { PUBLIC_DISCOUNT_LABEL } from "@/lib/public-discount";
import { CompactLeadForm } from "./LeadFormDock";
import styles from "./HeroSection.module.css";

const iconMap: Record<string, LucideIcon> = { Zap, Leaf, Shield, Clock };

interface HeroStat { icon: string; value: string; label: string }

const scenes = {
  day: { image: "/coesa-hero/day.jpg", label: "Dia", caption: "Usinas parceiras geram", description: "A energia das nossas usinas chegando até a sua casa" },
  night: { image: "/coesa-hero/night.jpg", label: "Noite", caption: "A economia continua", description: "Os créditos são compensados na sua fatura, sem instalar painéis em casa." },
} as const;
type Scene = keyof typeof scenes;

export function HeroSection() {
  const { configs } = useConfiguracoes();
  const [scene, setScene] = useState<Scene>("day");
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const clipPath = useTransform(scrollYProgress, [0, 0.8], ["inset(0% 0% 0% 0% round 0px)", "inset(9% 5% 9% 5% round 36px)"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.09]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -75]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const nightReveal = useTransform(scrollYProgress, [0.15, 0.55], [0, 1]);
  const dayTintOpacity = useTransform(scrollYProgress, [0.15, 0.55], [1, 0]);
  const endOpacity = useTransform(scrollYProgress, [0.32, 0.55], [0, 1]);
  const endScale = useTransform(scrollYProgress, [0.32, 0.55], [0.92, 1]);
  const endBlur = useTransform(scrollYProgress, [0.32, 0.55], ["blur(10px)", "blur(0px)"]);

  const stats = useMemo(() => {
    try {
      const parsed = JSON.parse(configs.hero_stats) as HeroStat[];
      return parsed.map((stat) => ({ ...stat, value: stat.label.toLowerCase() === "economia" ? PUBLIC_DISCOUNT_LABEL : stat.value, IconComponent: iconMap[stat.icon] || Zap }));
    } catch {
      return [
        { icon: "Zap", value: PUBLIC_DISCOUNT_LABEL, label: "Economia", IconComponent: Zap },
        { icon: "Leaf", value: "100%", label: "Energia Limpa", IconComponent: Leaf },
        { icon: "Shield", value: "5 anos", label: "Garantia", IconComponent: Shield },
        { icon: "Clock", value: "0", label: "Investimento", IconComponent: Clock },
      ];
    }
  }, [configs.hero_stats]);

  const scrollToBenefits = () => document.querySelector("#beneficios")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="inicio" data-scene={scene} ref={sectionRef} className={styles.hero} aria-labelledby="hero-title">
      <motion.div className={`${styles.stage} ${scene === "night" ? styles.night : ""}`} style={reducedMotion ? undefined : { clipPath }}>
        <motion.div className={styles.scene} style={reducedMotion ? undefined : { scale: imageScale }} aria-hidden="true">
          <Image src={scenes.day.image} alt="" fill priority sizes="100vw" className={styles.image} />
          <motion.div className={styles.nightImage} style={{ opacity: scene === "night" ? 1 : nightReveal }}>
            <Image src={scenes.night.image} alt="" fill sizes="100vw" className={styles.image} />
          </motion.div>
          <motion.div className={styles.tint} style={scene === "night" || reducedMotion ? undefined : { opacity: dayTintOpacity }} />
          <motion.div className={styles.fog} style={scene === "night" || reducedMotion ? undefined : { opacity: dayTintOpacity }} />
          <motion.div className={styles.scrollTint} style={scene === "night" || reducedMotion ? { opacity: 0 } : { opacity: nightReveal }} />
        </motion.div>

        <motion.div className={styles.content} style={reducedMotion ? undefined : { y: textY, opacity: introOpacity }}>
          <div className={styles.heading}>
            <h1 id="hero-title">Energia Solar{" "}<br /><span>por Assinatura</span></h1>
            <h2>{PUBLIC_DISCOUNT_LABEL} de desconto na energia compensada pela COESA. Sem placas, obras ou investimento.</h2>
          </div>

          <div className={styles.bottom}>
            <div className={styles.switch} role="group" aria-label="Visualizar energia de dia e à noite">
              {(["day", "night"] as const).map((key) => (
                <button key={key} type="button" aria-pressed={scene === key} className={scene === key ? styles.selected : ""} onClick={() => setScene(key)}>
                  <span>{key === "day" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}{scenes[key].label}</span>
                  <small>{scenes[key].caption}</small>
                </button>
              ))}
            </div>
            <p className={styles.description} aria-live="polite">{scenes[scene].description}</p>
            <div className={styles.leadForm}><CompactLeadForm /></div>
          </div>
        </motion.div>
        <motion.p className={styles.endStatement} style={reducedMotion ? { opacity: 0 } : { opacity: endOpacity, scale: endScale, filter: endBlur }}>
          Sua nova maneira de pensar energia!
        </motion.p>
        <button type="button" className={styles.scrollCue} onClick={scrollToBenefits} aria-label="Ir para benefícios"><ChevronDown size={26} /></button>
      </motion.div>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <stat.IconComponent size={20} aria-hidden="true" />
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
