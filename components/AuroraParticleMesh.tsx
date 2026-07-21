"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

export interface AuroraParticleMeshProps {
  isDark?: boolean;
  isIcon?: boolean;
  density?: number;
  speed?: number;
  size?: number;
  particleShape?: 'circle' | 'gemini_spark';
  waveOffset?: number;
  palette?: string[];
  style?: React.CSSProperties;
}

function drawGeminiSpark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.closePath();
  ctx.fill();
}

/**
 * AuroraParticleMesh renders an undulating grid of glowing particles inside aurora glow fields.
 * Uses purely rAF-driven dimension sampling to prevent ResizeObserver layout loops and crashes.
 */
export const AuroraParticleMesh: React.FC<AuroraParticleMeshProps> = ({
  isDark = true,
  isIcon = false,
  density = 5,
  speed = 2.0,
  size = 1.0,
  particleShape = 'circle',
  waveOffset,
  palette,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const propsRef = useRef({ isDark, isIcon, density, speed, size, particleShape, waveOffset, palette });
  propsRef.current = { isDark, isIcon, density, speed, size, particleShape, waveOffset, palette };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;

    const syncDimensions = () => {
      const w = Math.floor(container.clientWidth || container.offsetWidth || 0);
      const h = Math.floor(container.clientHeight || container.offsetHeight || 0);
      if (w <= 0 || h <= 0) return false;
      const newDpr = Math.max(1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1));
      if (Math.abs(w - cssW) < 2 && Math.abs(h - cssH) < 2 && newDpr === dpr) return true;
      dpr = newDpr;
      cssW = w;
      cssH = h;
      canvas.width = Math.floor(w * newDpr);
      canvas.height = Math.floor(h * newDpr);
      ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0);
      return true;
    };

    syncDimensions();

    let startTime = typeof performance !== "undefined" ? performance.now() : 0;

    const draw = (now: number) => {
      // Check dimensions safely inside rAF loop rather than triggering ResizeObserver layout cycles
      const ready = syncDimensions();
      if (!ready || cssW <= 0 || cssH <= 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, cssW, cssH);

      const p = propsRef.current;
      const t = ((now - startTime) * 0.001) * (p.speed ?? 1.0);
      const gridSpacing = p.isIcon
        ? Math.max(4, Math.min(10, (p.density ?? 14) * 0.6))
        : Math.max(6, Math.min(36, p.density ?? 14));
      const baseRadius = Math.max(0.6, Math.min(6, p.size ?? 2.2));

      const centerX = cssW * 0.5;
      const centerY = cssH * 0.5;

      const waveShift = p.waveOffset !== undefined ? ((p.waveOffset - 50) / 50) * 190 : 0;
      const activeCenterX = centerX + waveShift;

      let edgeOpacity = 1;
      if (p.waveOffset !== undefined) {
        if (p.waveOffset < 18) {
          const norm = Math.max(0, p.waveOffset / 18);
          edgeOpacity = 0.5 - 0.5 * Math.cos(norm * Math.PI);
        } else if (p.waveOffset > 82) {
          const norm = Math.max(0, (100 - p.waveOffset) / 18);
          edgeOpacity = 0.5 - 0.5 * Math.cos(norm * Math.PI);
        }
      }

      const defaultColors = p.isDark
        ? ["#ffffff", "#93c5fd", "#3b82f6", "#1d4ed8"]
        : ["#1f1f1f", "#0284c7", "#38bdf8", "#7dd3fc"];
      const colors = p.palette && p.palette.length > 0 ? p.palette : defaultColors;

      for (let y = gridSpacing * 0.5; y < cssH; y += gridSpacing) {
        for (let x = gridSpacing * 0.5; x < cssW; x += gridSpacing) {
          const dx = x - activeCenterX;
          const dy = y - centerY;
          
          // Dynamic falloff: wide span fading seamlessly before container edges
          const radiusX = cssW * 0.45;
          const radiusY = cssH * 0.45;
          const exp = p.isIcon ? 1.5 : 1.4;

          const normX = Math.abs(dx) / Math.max(1, radiusX);
          const normY = Math.abs(dy) / Math.max(1, radiusY);
          
          const falloffX = Math.max(0, 1 - Math.pow(normX, exp));
          const falloffY = Math.max(0, 1 - Math.pow(normY, exp));
          const falloff = falloffX * falloffY;

          if (falloff <= 0.005) continue;

          const wave1 = Math.sin(x * 0.06 + t * 2.2) * Math.cos(y * 0.06 + t * 1.8);
          const wave2 = Math.sin((x + y) * 0.04 - t * 1.5);
          const combinedWave = (wave1 + wave2) * 0.5;

          const rMod = 0.4 + 0.6 * ((combinedWave + 1) * 0.5);
          const dotR = baseRadius * rMod * Math.pow(falloff, 0.4);
          if (dotR < 0.15) continue;

          const alpha = Math.min(1, Math.max(0, edgeOpacity * falloff * (0.35 + 0.65 * ((combinedWave + 1) * 0.5))));
          
          const energy = Math.min(1, Math.max(0, falloff * 0.7 + ((combinedWave + 1) * 0.5) * 0.3));
          let color = colors[0];
          if (energy < 0.3) color = colors[3] || colors[colors.length - 1];
          else if (energy < 0.6) color = colors[2] || colors[Math.min(2, colors.length - 1)];
          else if (energy < 0.85) color = colors[1] || colors[0];

          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;

          if (p.particleShape === 'gemini_spark') {
            drawGeminiSpark(ctx, x, y, dotR * 1.5);
          } else {
            ctx.beginPath();
            ctx.arc(x, y, dotR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: "-48px",
        width: "calc(100% + 96px)",
        height: "calc(100% + 96px)",
        overflow: "hidden",
        pointerEvents: "none",
        WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0) 90%)",
        maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0) 90%)",
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block"
        }}
      />
    </div>
  );
};
