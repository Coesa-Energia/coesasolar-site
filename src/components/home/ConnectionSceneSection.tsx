"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type SpaceNode = { x: number; y: number; z: number; source: boolean };
type SpaceEdge = [number, number];
type ProjectedNode = SpaceNode & { screenX: number; screenY: number; depth: number; scale: number };

const spaceNodes: SpaceNode[] = Array.from({ length: 64 }, (_, index) => {
  const angle = index * 2.39996;
  const radius = 0.22 + ((index * 37) % 100) / 100 * 0.9;
  const depth = -1 + ((index * 53) % 100) / 100 * 2;
  return { x: Math.cos(angle) * radius * 1.3, y: Math.sin(angle * 1.17) * radius * 0.92, z: depth, source: index % 8 === 0 };
});

const spaceEdges = (() => {
  const edgeKeys = new Set<string>();
  const result: SpaceEdge[] = [];
  spaceNodes.forEach((node, index) => {
    spaceNodes
      .map((candidate, candidateIndex) => ({ candidate, candidateIndex }))
      .filter(({ candidateIndex }) => candidateIndex !== index)
      .sort(({ candidate: a }, { candidate: b }) => {
        const distanceA = (a.x - node.x) ** 2 + (a.y - node.y) ** 2 + (a.z - node.z) ** 2;
        const distanceB = (b.x - node.x) ** 2 + (b.y - node.y) ** 2 + (b.z - node.z) ** 2;
        return distanceA - distanceB;
      })
      .slice(0, 4)
      .forEach(({ candidateIndex }) => {
        const start = Math.min(index, candidateIndex);
        const end = Math.max(index, candidateIndex);
        const key = `${start}-${end}`;
        if (!edgeKeys.has(key)) {
          edgeKeys.add(key);
          result.push([start, end]);
        }
      });
  });
  return result;
})();

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function project(node: SpaceNode, width: number, height: number, progress: number, time: number): ProjectedNode {
  const yaw = (progress - 0.5) * 0.7 + Math.sin(time * 0.00012) * 0.045;
  const pitch = -0.16 + Math.cos(time * 0.00009) * 0.025;
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const rotatedX = node.x * cosYaw - node.z * sinYaw;
  const rotatedZ = node.x * sinYaw + node.z * cosYaw;
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const rotatedY = node.y * cosPitch - rotatedZ * sinPitch;
  const depth = rotatedY * sinPitch + rotatedZ * cosPitch;
  const scale = 1.78 / (2.6 - depth * 1.08);
  return { ...node, screenX: width / 2 + rotatedX * width * 0.48 * scale, screenY: height / 2 + rotatedY * height * 0.78 * scale, depth, scale };
}

function drawNetwork(canvas: HTMLCanvasElement, progressRef: { current: number }, theme: "dark" | "light" = "dark") {
  const context = canvas.getContext("2d");
  if (!context) return () => undefined;
  let width = 1;
  let height = 1;
  let frame = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const edgeColor = theme === "light" ? "79, 94, 79" : "212, 220, 205";
  const packetColor = theme === "light" ? "52, 93, 63" : "244, 239, 226";

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };

  const render = (timestamp: number) => {
    const time = reducedMotion ? 0 : timestamp;
    const progress = progressRef.current;
    const connection = clamp((progress + 0.08) / 0.54);
    const flow = clamp((progress - 0.12) / 0.78);
    const projected = spaceNodes.map((node) => project(node, width, height, progress, time));
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";

    spaceEdges.slice().sort((first, second) => {
      const firstDepth = (projected[first[0]].depth + projected[first[1]].depth) / 2;
      const secondDepth = (projected[second[0]].depth + projected[second[1]].depth) / 2;
      return firstDepth - secondDepth;
    }).forEach(([startIndex, endIndex], edgeIndex) => {
      const start = projected[startIndex];
      const end = projected[endIndex];
      const depth = (start.depth + end.depth) / 2;
      const sourceEdge = start.source || end.source;
      const depthLight = clamp((depth + 1.15) / 2.1);
      const opacity = (0.18 + depthLight * 0.66) * (0.72 + connection * 0.28);
      context.beginPath();
      context.moveTo(start.screenX, start.screenY);
      context.lineTo(end.screenX, end.screenY);
      context.strokeStyle = `rgba(${edgeColor}, ${theme === "light" ? opacity * 0.7 : opacity})`;
      context.lineWidth = sourceEdge ? 0.7 + depthLight * 1.1 : 0.28 + depthLight * 0.95;
      context.lineCap = "round";
      context.stroke();

      if (sourceEdge && flow > 0) {
        const packetProgress = (flow * 1.2 + edgeIndex * 0.071 + time * 0.000035) % 1;
        const packetX = start.screenX + (end.screenX - start.screenX) * packetProgress;
        const packetY = start.screenY + (end.screenY - start.screenY) * packetProgress;
        const trailProgress = Math.max(0, packetProgress - 0.1);
        context.beginPath();
        context.moveTo(start.screenX + (end.screenX - start.screenX) * trailProgress, start.screenY + (end.screenY - start.screenY) * trailProgress);
        context.lineTo(packetX, packetY);
        context.strokeStyle = `rgba(${packetColor}, 0.55)`;
        context.lineWidth = 0.9 + depthLight * 1.4;
        context.stroke();
        context.beginPath();
        context.arc(packetX, packetY, 1.6 + depthLight * 2.5, 0, Math.PI * 2);
        context.fillStyle = `rgba(${packetColor}, 0.92)`;
        context.shadowColor = `rgba(${packetColor}, 0.72)`;
        context.shadowBlur = 10;
        context.fill();
        context.shadowBlur = 0;
      }
    });

    projected.slice().sort((a, b) => a.depth - b.depth).forEach((node) => {
      const reveal = node.source ? 0.9 : clamp((progress - 0.02) / 0.32 + (node.depth + 0.8) * 0.12);
      const depthLight = clamp((node.depth + 1.15) / 2.1);
      const radius = (node.source ? 11 : 2.1 + depthLight * 4.8) * node.scale;
      context.globalAlpha = reveal;
      if (node.source) {
        context.beginPath();
        context.arc(node.screenX, node.screenY, radius * (1.9 + Math.sin(time * 0.0015) * 0.12), 0, Math.PI * 2);
        context.strokeStyle = `rgba(${edgeColor}, 0.18)`;
        context.lineWidth = 1;
        context.stroke();
      }
      context.beginPath();
      context.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2);
      context.fillStyle = node.source
        ? `rgba(${theme === "light" ? "238, 229, 211" : "12, 15, 13"}, 0.98)`
        : `rgba(${theme === "light" ? "226, 219, 201" : "18, 21, 18"}, ${0.7 + depthLight * 0.28})`;
      context.fill();
      context.strokeStyle = node.source ? `rgba(${theme === "light" ? "52, 93, 63" : "244, 239, 226"}, 0.96)` : `rgba(${edgeColor}, ${0.42 + depthLight * 0.58})`;
      context.lineWidth = node.source ? 1.2 : 0.55 + depthLight * 0.55;
      context.stroke();
      if (depthLight > 0.66 && !node.source) {
        context.beginPath();
        context.arc(node.screenX, node.screenY, radius * 1.8, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${edgeColor}, ${0.08 + (depthLight - 0.66) * 0.35})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
      context.beginPath();
      context.arc(node.screenX, node.screenY, node.source ? radius * 0.24 : radius * 0.38, 0, Math.PI * 2);
      context.fillStyle = `rgba(${theme === "light" ? "52, 93, 63" : "244, 239, 226"}, 0.84)`;
      context.fill();
      context.globalAlpha = 1;
    });

    if (!reducedMotion) frame = requestAnimationFrame(render);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  frame = requestAnimationFrame(render);
  return () => { cancelAnimationFrame(frame); observer.disconnect(); };
}

export function FlowCanvas({ progress, theme = "dark" }: { progress: number; theme?: "dark" | "light" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => {
    if (process.env.NODE_ENV === "test" || !canvasRef.current) return undefined;
    return drawNetwork(canvasRef.current, progressRef, theme);
  }, [theme]);
  return <div role="img" aria-label="Cena de scroll mostrando energia saindo de usinas e chegando a clientes" className="absolute inset-0"><canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" /></div>;
}

const scenes = [
  { label: "01 · A conexão", title: <>A energia encontra<br /><span>um caminho só.</span></>, body: "Usinas e clientes passam a fazer parte da mesma rede. A distribuidora continua cuidando dos fios." },
  { label: "02 · O fluxo", title: <>A energia circula.<br /><span>Você acompanha.</span></>, body: "A energia sai de uma usina, atravessa a rede e chega até a sua conta. Sem obra, sem visita técnica." },
  { label: "03 · A conta", title: <>Do outro lado,<br /><span>uma conta simples.</span></>, body: "A COESA organiza a complexidade. Você vê a economia, acompanha tudo no app e paga uma vez só." },
];

export function ConnectionSceneSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.round(value * 100) / 100;
    setProgress((current) => current === next ? current : next);
  });
  const sceneIndex = progress < 0.34 ? 0 : progress < 0.7 ? 1 : 2;
  const scene = scenes[sceneIndex];

  return <section id="rede" ref={sectionRef} className="relative h-[300vh] bg-[#090b09] text-[#f3f0e7]">
    <div className="sticky top-0 h-screen min-h-[680px] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(214,204,177,0.12),transparent_30%),linear-gradient(120deg,#080a08,#171c17_56%,#0a0d0a)]" />
      <FlowCanvas progress={progress} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(9,11,9,0.96)_0%,rgba(9,11,9,0.68)_34%,transparent_74%),linear-gradient(0deg,rgba(9,11,9,0.8)_0%,transparent_32%,rgba(9,11,9,0.18)_100%)]" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-10 sm:px-8 lg:px-14 lg:pb-16 xl:px-20">
        <motion.div key={sceneIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/48">{scene.label}</p>
          <h2 className="mt-5 text-[clamp(2.8rem,6vw,6.8rem)] font-medium leading-[0.9] tracking-[-0.075em] text-white">{scene.title}</h2>
          <p className="mt-7 max-w-md text-base leading-relaxed text-white/62 sm:text-lg">{scene.body}</p>
          <div className="mt-10 grid max-w-md grid-cols-2 border-t border-white/15 pt-5"><div><strong className="block text-3xl font-medium tracking-[-0.05em] text-white">+2.000</strong><span className="mt-1 block text-sm text-white/48">clientes COESA</span></div><div><strong className="block text-3xl font-medium tracking-[-0.05em] text-white">R$ 0</strong><span className="mt-1 block text-sm text-white/48">de adesão</span></div></div>
        </motion.div>
        <div className="mt-8 flex items-end justify-between gap-6 border-t border-white/10 pt-4 text-xs text-white/42"><span>{sceneIndex === 0 ? "As usinas entram na rede." : sceneIndex === 1 ? "O fluxo chega até você." : "A conta fica mais simples."}</span><span className="hidden sm:block">Role para acompanhar</span></div>
      </div>
      {progress > 0.82 && <button type="button" onClick={() => window.dispatchEvent(new Event("coesa:open-lead-form"))} className="group absolute bottom-10 right-5 z-20 inline-flex items-center gap-3 text-sm text-white/72 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4efe2] sm:right-8 lg:right-14 xl:right-20">Simular minha conta <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></button>}
    </div>
  </section>;
}
