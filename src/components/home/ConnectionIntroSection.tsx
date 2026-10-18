"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import styles from "./ConnectionIntroSection.module.css";

type Part = { kind: "word"; word: string; accent: boolean } | { kind: "image"; src: string; alt: string };
const words = (text: string, accent = false): Part[] => text.split(" ").map((word) => ({ kind: "word", word, accent }));

// Sequência e intervalos seguem a seção 03-manifesto do Gridora fornecida pelo usuário.
const parts: Part[] = [
  ...words("A maneira com que você se locomove na cidade, mudou."),
  { kind: "image", src: "/coesa-hero/uber-logo.png", alt: "Uber" },
  ...words("O jeito que você se comunica, já não é mais o mesmo."),
  { kind: "image", src: "/coesa-hero/whatsapp-logo.png", alt: "WhatsApp" },
  ...words("A maneira com que você assiste filmes e séries também."),
  { kind: "image", src: "/coesa-hero/netflix-logo.png", alt: "Netflix" },
  ...words("Por que só a nossa maneira de pensar energia é a mesma?", true),
  ...words("COESA Energia Inteligente:"),
  ...words("Sem placas, obras ou investimento inicial. Desconto na sua conta luz.", true),
];
const step = 0.78 / parts.length;

function RevealedWord({ word, accent, progress, range, still }: { word: string; accent: boolean; progress: MotionValue<number>; range: [number, number]; still: boolean }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, ["0.22em", "0em"]);
  return <motion.span className={`${styles.word} ${accent ? styles.accent : ""}`} style={still ? undefined : { opacity, y }}>{word}</motion.span>;
}

function RevealedImage({ src, alt, progress, range, still }: { src: string; alt: string; progress: MotionValue<number>; range: [number, number]; still: boolean }) {
  const clipPath = useTransform(progress, range, ["inset(0% 100% 0% 0% round 999px)", "inset(0% 0% 0% 0% round 999px)"]);
  const scale = useTransform(progress, range, [1.5, 1]);
  return <motion.span className={`${styles.inlineImage} ${alt === "Uber" ? styles.uber : ""}`} style={still ? undefined : { clipPath }}>
    <motion.span className={styles.inlineImageInner} style={still ? undefined : { scale }}>
      <Image src={src} alt={alt} fill sizes="64px" className={styles.image} />
    </motion.span>
  </motion.span>;
}

export function ConnectionIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useTransform(scrollYProgress, [0.06, 0.84], [0, 1]);
  const percent = useTransform(progress, (value) => `${Math.round(value * 100)}%`);

  return <section id="conexao" ref={sectionRef} aria-labelledby="conexao-titulo" className={`${styles.section} ${reducedMotion ? styles.still : ""}`}>
    <div className={styles.sticky}>
      <div className={styles.inner}>
        <div className={styles.headingRow}>
          <h2 id="conexao-titulo" className={styles.label}><span aria-hidden="true" />Por que COESA</h2>
          <span aria-hidden="true" className={styles.rule} />
        </div>
        <p className={styles.copy}>
          {parts.map((part, index) => {
            const start = 0.06 + index * step;
            const range: [number, number] = [start, Math.min(start + 3 * step, 0.84)];
            return <span key={index}>
              {part.kind === "word"
                ? <RevealedWord word={part.word} accent={part.accent} progress={scrollYProgress} range={range} still={reducedMotion} />
                : <RevealedImage src={part.src} alt={part.alt} progress={scrollYProgress} range={range} still={reducedMotion} />}
              {index < parts.length - 1 ? " " : null}
            </span>;
          })}
        </p>
        <div aria-hidden="true" className={styles.progressRow}>
          <span>ENERGIA EM MOVIMENTO</span>
          <span className={styles.track}><motion.span className={styles.fill} style={reducedMotion ? { scaleX: 1 } : { scaleX: progress }} /></span>
          <motion.span className={styles.percent}>{reducedMotion ? "100%" : percent}</motion.span>
        </div>
      </div>
    </div>
  </section>;
}
