"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const SolarFarmSection = dynamic(() => import("./SolarFarmSection").then((module) => module.SolarFarmSection), { ssr: false });
const ConnectionSceneSection = dynamic(() => import("./ConnectionSceneSection").then((module) => module.ConnectionSceneSection), { ssr: false });
const ClientAreaSection = dynamic(() => import("./ClientAreaSection").then((module) => module.ClientAreaSection), { ssr: false });
const SimulationSection = dynamic(() => import("./SimulationSection").then((module) => module.SimulationSection), { ssr: false });

type Section = "rede" | "usina" | "app" | "simulacao";

export function DeferredHomeSection({ section }: { section: Section }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setNear(true);
      return;
    }
    const element = ref.current;
    if (!element || !window.IntersectionObserver) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: "1400px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  if (near) {
    if (section === "rede") return <ConnectionSceneSection />;
    if (section === "usina") return <SolarFarmSection />;
    if (section === "app") return <ClientAreaSection />;
    return <SimulationSection />;
  }

  const id = section === "rede" ? "rede" : section === "usina" ? "usina-solar" : section === "app" ? "app-coesa" : "simulacao";
  const background = section === "rede" ? "#090b09" : section === "usina" ? "#f4efe3" : section === "app" ? "#f5f6f2" : "#edece2";
  return <div ref={ref} id={id} aria-busy="true" style={{ minHeight: section === "rede" ? "400svh" : section === "app" ? "600svh" : "100svh", background }} />;
}
