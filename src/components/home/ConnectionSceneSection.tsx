"use client";

import { openLeadForm } from "@/lib/lead-funnel";
import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type SpaceNode = { x: number; y: number; z: number; source: boolean };
type SpaceEdge = [number, number];
type ProjectedNode = SpaceNode & { screenX: number; screenY: number; depth: number; scale: number };

const spaceNodes: SpaceNode[] = Array.from({ length: 48 }, (_, index) => {
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
      .slice(0, 3)
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
  return { ...node, screenX: width * 0.66 + rotatedX * width * 0.38 * scale, screenY: height / 2 + rotatedY * height * 0.78 * scale, depth, scale };
}

function drawNetwork(canvas: HTMLCanvasElement, progressRef: { current: number }, theme: "dark" | "light" = "dark") {
  const context = canvas.getContext("2d");
  if (!context) return () => undefined;
  let width = 1;
  let height = 1;
  let frame = 0;
  let visible = false;
  let lastPaint = 0;
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
    if (!reducedMotion && timestamp - lastPaint < 32) {
      frame = requestAnimationFrame(render);
      return;
    }
    lastPaint = timestamp;
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

    if (visible && !reducedMotion && !document.hidden) frame = requestAnimationFrame(render);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(frame);
    if (visible && !document.hidden) frame = requestAnimationFrame(render);
  });
  const onVisibilityChange = () => {
    cancelAnimationFrame(frame);
    if (visible && !document.hidden) frame = requestAnimationFrame(render);
  };
  visibilityObserver.observe(canvas);
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => { cancelAnimationFrame(frame); observer.disconnect(); visibilityObserver.disconnect(); document.removeEventListener("visibilitychange", onVisibilityChange); };
}

export function FlowCanvas({ progress, theme = "dark" }: { progress: number; theme?: "dark" | "light" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => {
    if (process.env.NODE_ENV === "test" || !canvasRef.current) return undefined;
    return drawNetwork(canvasRef.current, progressRef, theme);
  }, [theme]);
  return <div role="img" aria-label="Fluxo de energia entre usinas, rede e clientes" className="pointer-events-none absolute inset-0 opacity-75"><canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" /></div>;
}

const scenes = [
  { label: "01 · A conexão", title: <>A energia encontra<br /><span className="text-[#b4cbb0]">um caminho só.</span></>, body: "Usinas e clientes passam a fazer parte da mesma rede. A distribuidora continua cuidando dos fios." },
  { label: "02 · O fluxo", title: <>A energia circula.<br /><span className="text-[#b4cbb0]">Você acompanha.</span></>, body: "A energia sai de uma usina, atravessa a rede e chega até sua conta. Sem obra ou troca de medidor." },
  { label: "03 · A conta", title: <>Do outro lado,<br /><span className="text-[#b4cbb0]">uma conta simples.</span></>, body: "A COESA organiza a compensação. Você vê a economia, acompanha no app e entende cada fatura." },
];

const steps = [
  { label: "01 / Usina", body: "Usinas parceiras geram energia." },
  { label: "02 / Rede", body: "A distribuidora cuida dos fios." },
  { label: "03 / Sua conta", body: "Os créditos entram na conta. Você vê a economia no app." },
];

export function ConnectionSceneSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(Math.round(value * 100) / 100);
  });
  const displayProgress = reducedMotion ? 1 : progress;
  const sceneIndex = displayProgress < 0.34 ? 0 : displayProgress < 0.7 ? 1 : 2;
  const scene = scenes[sceneIndex];

  return <section id="rede" ref={sectionRef} aria-labelledby="rede-titulo" className="relative h-[300svh] bg-[#090b09] text-[#f3f0e7] motion-reduce:h-auto">
    <div className="sticky top-20 isolate flex h-[calc(100svh-80px)] flex-col justify-between overflow-hidden px-5 py-5 sm:px-8 sm:py-8 lg:px-14 lg:py-12 xl:px-20 motion-reduce:static motion-reduce:min-h-[calc(100svh-80px)] motion-reduce:h-auto">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_38%,rgba(214,204,177,0.12),transparent_30%),linear-gradient(120deg,#080a08,#171c17_56%,#0a0d0a)]" />
      <FlowCanvas progress={displayProgress} />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(9,11,9,0.96)_0%,rgba(9,11,9,0.76)_35%,transparent_80%),linear-gradient(0deg,rgba(9,11,9,0.82)_0%,transparent_42%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/48">{scene.label}</p>
        <h2 id="rede-titulo" className="mt-4 max-w-3xl text-[clamp(2.4rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.075em] text-white">{scene.title}</h2>
        <p className="mt-3 max-w-md text-base leading-relaxed text-white/66 sm:mt-5 sm:text-lg">{scene.body}</p>
        {displayProgress > 0.82 && <button type="button" onClick={() => openLeadForm("connection_scene")} className="mt-4 inline-flex items-center gap-2 text-sm text-white/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4efe2] sm:mt-7">Simular minha conta <ArrowUpRight className="h-4 w-4" /></button>}
      </div>
      <div className="relative z-10 mx-auto mt-5 grid w-full max-w-[1600px] gap-3 border-t border-white/20 pt-4 sm:mt-10 sm:grid-cols-3 sm:gap-7 sm:pt-5">
        {steps.map((step) => <div key={step.label} className="last:pr-16 sm:last:pr-0"><h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#b4cbb0]">{step.label}</h3><p className="mt-2 max-w-xs text-sm leading-snug text-white/70">{step.body}</p></div>)}
      </div>
    </div>
  </section>;
}
