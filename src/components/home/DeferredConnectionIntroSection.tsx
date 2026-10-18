"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import dynamic from "next/dynamic";
import { parts } from "./connectionIntroParts";
import styles from "./ConnectionIntroSection.module.css";

const ConnectionIntroSection = dynamic(() => import("./ConnectionIntroSection").then((module) => module.ConnectionIntroSection), { ssr: false, loading: () => <IntroPlaceholder /> });

function IntroPlaceholder({ observeRef }: { observeRef?: Ref<HTMLElement> }) {
  return <section ref={observeRef} id="conexao" aria-labelledby="conexao-titulo" aria-busy="true" className={styles.section}>
    <div className={styles.sticky}><div className={styles.inner}>
      <div className={styles.headingRow}>
        <h2 id="conexao-titulo" className={styles.label}><span aria-hidden="true" />Por que COESA</h2>
        <span aria-hidden="true" className={styles.rule} />
      </div>
      <p className={styles.copy}>
        {parts.map((part, index) => part.kind === "word" ? <span key={index} className={`${styles.word} ${part.accent ? styles.accent : ""}`} style={{ opacity: 0.12 }}>{part.word} </span> : null)}
      </p>
      <div aria-hidden="true" className={styles.progressRow}>
        <span>ENERGIA EM MOVIMENTO</span><span className={styles.track} /><span className={styles.percent}>0%</span>
      </div>
    </div></div>
  </section>;
}

export function DeferredConnectionIntroSection() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    if (location.hash === "#conexao" || matchMedia("(prefers-reduced-motion: reduce)").matches || !window.IntersectionObserver) {
      setNear(true);
      return;
    }
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: "700px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  return near ? <ConnectionIntroSection /> : <IntroPlaceholder observeRef={ref} />;
}
