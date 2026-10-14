"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

// Adapted from https://ruixen.com/docs/components/progressive-flux-loader
export function ProgressiveFluxBar({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const reducedMotion = useReducedMotion();
  const fillWidth = useTransform(scrollProgress, (value) => `${Math.max(0, Math.min(1, value)) * 20}%`);

  return (
    <div
      role="progressbar"
      aria-label="Desconto COESA"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={20}
      aria-valuetext="20% de desconto COESA"
      className="relative h-4 w-full overflow-hidden rounded-full bg-[#262820] shadow-[inset_0_2px_3px_rgba(0,0,0,0.25)]"
    >
      <motion.div
        className="relative ml-auto h-full overflow-hidden rounded-full"
        style={{
          width: fillWidth,
          background: "linear-gradient(90deg, #426d46 0%, #7dbb75 35%, #b5e7a3 55%, #7dbb75 78%, #426d46 100%)",
          boxShadow: "0 0 18px rgba(115, 187, 105, 0.6), inset 0 1px 0 rgba(255,255,255,0.55)",
        }}
      >
        {!reducedMotion && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)", mixBlendMode: "screen" }}
            animate={{ x: ["-110%", "210%"] }}
            transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
}
