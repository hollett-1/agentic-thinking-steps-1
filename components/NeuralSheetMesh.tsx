"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

export interface NeuralSheetMeshProps {
  isDark?: boolean;
  density?: number;
  speed?: number;
  amplitude?: number;
  wireframeOpacity?: number;
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
 * NeuralSheetMesh renders an undulating 3D wireframe mesh (blanket / flag / sheet)
 * with depth perspective, connecting lines, and glowing nodes.
 */
export const NeuralSheetMesh: React.FC<NeuralSheetMeshProps> = ({
  isDark = true,
  density = 18,
  speed = 1.8,
  amplitude = 25,
  wireframeOpacity = 0.35,
  particleShape = 'circle',
  waveOffset,
  palette,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const propsRef = useRef({ isDark, density, speed, amplitude, wireframeOpacity, particleShape, waveOffset, palette });
  propsRef.current = { isDark, density, speed, amplitude, wireframeOpacity, particleShape, waveOffset, palette };

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
      const ready = syncDimensions();
      if (!ready || cssW <= 0 || cssH <= 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, cssW, cssH);

      const p = propsRef.current;
      const t = ((now - startTime) * 0.001) * (p.speed ?? 1.8);
      const gridSpacing = Math.max(4, Math.min(40, p.density ?? 18));
      const amp = p.amplitude ?? 25;
      const wireOpacity = p.wireframeOpacity ?? 0.35;

      const centerX = cssW * 0.5;
      const centerY = cssH * 0.5;
      const perspective = 350;

      const defaultColors = p.isDark
        ? ["#ffffff", "#93c5fd", "#3b82f6", "#1d4ed8"]
        : ["#1f1f1f", "#0284c7", "#38bdf8", "#7dd3fc"];
      const colors = p.palette && p.palette.length > 0 ? p.palette : defaultColors;

      const cols = Math.ceil(cssW / gridSpacing) + 2;
      const rows = Math.ceil(cssH / gridSpacing) + 2;

      const gridNodes: Array<Array<{
        x: number;
        y: number;
        z: number;
        projX: number;
        projY: number;
        scale: number;
        falloff: number;
      }>> = [];

      const startX = (cssW - (cols - 1) * gridSpacing) * 0.5;
      const startY = (cssH - (rows - 1) * gridSpacing) * 0.5;

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

      for (let r = 0; r < rows; r++) {
        gridNodes[r] = [];
        for (let c = 0; c < cols; c++) {
          const rawX = startX + c * gridSpacing;
          const rawY = startY + r * gridSpacing;

          const waveShift = p.waveOffset !== undefined ? ((p.waveOffset - 50) / 50) * 190 : 0;
          const activeCenterX = centerX + waveShift;

          const dx = rawX - activeCenterX;
          const dy = rawY - centerY;

          const radiusX = cssW * 0.45;
          const radiusY = cssH * 0.45;
          const exp = 1.4;

          const normX = Math.abs(dx) / (radiusX || 1);
          const normY = Math.abs(dy) / (radiusY || 1);
          const falloff = Math.max(0, 1 - Math.pow(normX, exp)) * Math.max(0, 1 - Math.pow(normY, exp));

          // 3D Undulating wave surface calculation
          const z1 = Math.sin(c * 0.35 + t * 2.2) * Math.cos(r * 0.35 + t * 1.8) * amp;
          const z2 = Math.sin((c + r) * 0.25 - t * 1.4) * (amp * 0.6);
          const z = (z1 + z2) * falloff;

          const scale = perspective / (perspective + z);
          const projX = centerX + dx * scale;
          const projY = centerY + dy * scale;

          gridNodes[r][c] = { x: rawX, y: rawY, z, projX, projY, scale, falloff };
        }
      }

      // Draw Wireframe Connecting Lines (Sheet / Flag Mesh Threads)
      if (wireOpacity > 0.01 && edgeOpacity > 0.01) {
        ctx.lineWidth = 1;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const n1 = gridNodes[r][c];
            if (n1.falloff <= 0.02) continue;

            // Horizontal Thread
            if (c < cols - 1) {
              const n2 = gridNodes[r][c + 1];
              if (n2.falloff > 0.02) {
                const avgFalloff = (n1.falloff + n2.falloff) * 0.5;
                const avgScale = (n1.scale + n2.scale) * 0.5;
                const lineAlpha = wireOpacity * avgFalloff * Math.pow(avgScale, 1.5) * edgeOpacity;
                ctx.strokeStyle = colors[1] || colors[0];
                ctx.globalAlpha = Math.min(1, Math.max(0, lineAlpha));
                ctx.beginPath();
                ctx.moveTo(n1.projX, n1.projY);
                ctx.lineTo(n2.projX, n2.projY);
                ctx.stroke();
              }
            }

            // Vertical Thread
            if (r < rows - 1) {
              const n3 = gridNodes[r + 1][c];
              if (n3.falloff > 0.02) {
                const avgFalloff = (n1.falloff + n3.falloff) * 0.5;
                const avgScale = (n1.scale + n3.scale) * 0.5;
                const lineAlpha = wireOpacity * avgFalloff * Math.pow(avgScale, 1.5) * edgeOpacity;
                ctx.strokeStyle = colors[2] || colors[0];
                ctx.globalAlpha = Math.min(1, Math.max(0, lineAlpha));
                ctx.beginPath();
                ctx.moveTo(n1.projX, n1.projY);
                ctx.lineTo(n3.projX, n3.projY);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Draw Mesh Glowing Node Particles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const n = gridNodes[r][c];
          if (n.falloff <= 0.02) continue;

          const baseRadius = 2.2 * n.scale * Math.pow(n.falloff, 0.7);
          if (baseRadius < 0.3) continue;

          const energy = Math.min(1, Math.max(0, (n.z + amp) / (amp * 2)));
          const alpha = Math.min(1, Math.max(0, edgeOpacity * n.falloff * (0.4 + 0.6 * energy)));

          let color = colors[0];
          if (energy < 0.3) color = colors[3] || colors[colors.length - 1];
          else if (energy < 0.6) color = colors[2] || colors[Math.min(2, colors.length - 1)];
          else if (energy < 0.85) color = colors[1] || colors[0];

          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;

          if (p.particleShape === 'gemini_spark') {
            drawGeminiSpark(ctx, n.projX, n.projY, baseRadius * 1.5);
          } else {
            ctx.beginPath();
            ctx.arc(n.projX, n.projY, baseRadius, 0, Math.PI * 2);
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
          pointerEvents: "none"
        }}
      />
    </div>
  );
};
