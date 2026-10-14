"use client";
// Source: https://21st.dev/@efferd/components/dotted-surface
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref"> & {
  size?: number;
  opacity?: number;
  sizeAttenuation?: boolean;
  vertexColors?: boolean;
};

export function DottedSurface({
  className,
  size = 8,
  opacity = 0.8,
  sizeAttenuation = true,
  vertexColors = true,
  ...props
}: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    const container = containerRef.current;
    if (!container) return;

    const SEPARATION = 150;
    const AMOUNTX = 40;
    const AMOUNTY = 60;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf4eddf, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
      60,
      1,
      1,
      10000,
    );
    camera.position.set(0, 355, 1220);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(scene.fog.color, 0);

    container.appendChild(renderer.domElement);

    // Create particles
    const positions: number[] = [];
    const colors: number[] = [];

    // Create geometry for all particles
    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0; // Will be animated
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions.push(x, y, z);
        colors.push(0, 0, 0);
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Create material
    const material = new THREE.PointsMaterial({
      size,
      vertexColors,
      color: 0x243329,
      transparent: true,
      opacity,
      sizeAttenuation,
    });

    // Create points object
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;
    let visible = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Animation function
    const animate = () => {
      const positionAttribute = geometry.attributes.position;
      const positions = positionAttribute.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;

          // Animate Y position with sine waves
          positions[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;

          i++;
        }
      }

      positionAttribute.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.1;
      if (visible && !reducedMotion) animationId = requestAnimationFrame(animate);
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = Math.max(width, 1) / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1));
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(animationId);
      if (visible) animate();
    });
    visibilityObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [size, opacity, sizeAttenuation, vertexColors]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      {...props}
    />
  );
}

export default DottedSurface;
