import React, { useEffect, useRef, useState } from 'react';
import { ProductIconType } from '../types';
import { ProductIcon } from './Loader';

interface ProductOrbitVortexProps {
  isDark: boolean;
  icons?: ProductIconType[];
  isInProgress?: boolean;
  starCount?: number;
  speedMultiplier?: number;
  hasContainment?: boolean;
  spiralMotion?: boolean;
  randomZSpace?: boolean;
  cameraPitch?: number;
  isFlat2D?: boolean;
  steppedMotion?: boolean;
  particleDiameter?: number;
}

const DEFAULT_ICONS: ProductIconType[] = ['gmail', 'docs', 'sheets', 'drive', 'chat', 'calendar'];

const ICON_LABELS: Record<ProductIconType, string> = {
  gmail: 'Gmail',
  docs: 'Google Docs',
  sheets: 'Google Sheets',
  drive: 'Google Drive',
  chat: 'Google Chat',
  calendar: 'Google Calendar'
};

export const ProductOrbitVortex: React.FC<ProductOrbitVortexProps> = ({
  isDark,
  icons = DEFAULT_ICONS,
  isInProgress = true,
  starCount = 35,
  speedMultiplier = 0.8,
  hasContainment = false,
  spiralMotion = false,
  randomZSpace = false,
  cameraPitch = 0,
  isFlat2D = false,
  steppedMotion = false,
  particleDiameter = 3.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Click-and-Drag Momentum Physics
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    angleOffset: 0,
    pitchOffset: 0,
    vx: 0,
    vy: 0,
  });

  const activeIcons = (icons && icons.length > 0) ? icons : DEFAULT_ICONS;

  // Pointer drag event handlers to rotate carousel
  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    dragRef.current.lastTime = performance.now();
    dragRef.current.vx = 0;
    dragRef.current.vy = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const now = performance.now();
    const dt = Math.max(0.001, (now - dragRef.current.lastTime) / 1000);
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;

    const angleDelta = (dx / 120) * Math.PI;
    const pitchDelta = isFlat2D ? 0 : -(dy / 90) * (Math.PI / 4);

    dragRef.current.angleOffset += angleDelta;
    dragRef.current.pitchOffset = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, dragRef.current.pitchOffset + pitchDelta));

    dragRef.current.vx = angleDelta / dt;
    dragRef.current.vy = pitchDelta / dt;

    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    dragRef.current.lastTime = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Helper to compute rotation angle (linear vs smooth stepped & eased curve)
  const getRotationAngle = (basePhase: number, elapsed: number, count: number) => {
    if (!steppedMotion) {
      return basePhase + elapsed * (0.55 * speedMultiplier);
    }
    const slotInterval = (Math.PI * 2) / Math.max(1, count);
    const cycleDuration = 1.35 / Math.max(0.2, speedMultiplier);
    const progress = elapsed / cycleDuration;
    const step = Math.floor(progress);
    const sub = progress - step;

    let ease = 0;
    const restThreshold = 0.28; // Gentle poise for first 28% of cycle
    if (sub > restThreshold) {
      const u = (sub - restThreshold) / (1 - restThreshold);
      // Smooth, refined cubic bezier easeInOut curve
      ease = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    }

    return basePhase + (step + ease) * slotInterval;
  };

  // Render ambient canvas particles rotating with ease in X/Y (and 3D when not in 2D flat mode)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const count = Math.max(0, starCount);
    const particleColor = isDark ? '#c4c7c5' : '#444746';
    const baseParticleRadius = Math.max(0.5, particleDiameter / 2);

    // Distribute particles across the full 2D XY container area
    const particles = Array.from({ length: count }).map((_, i) => ({
      angleOffset: (i * Math.PI * 2) / Math.max(1, count) + (Math.random() * 0.4),
      flatRadius: 18 + Math.random() * 78, // Scattered throughout 2D XY container
      radiusFactorX: 0.25 + (Math.random() * 1.35),
      radiusFactorY: 0.25 + (Math.random() * 1.35),
      zOffset: (randomZSpace && !isFlat2D) ? (Math.random() - 0.5) * 100 : (Math.random() - 0.5) * 35,
    }));

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = canvas.width = canvas.parentElement?.clientWidth || 320;
      const h = canvas.height = canvas.parentElement?.clientHeight || (isFlat2D ? 200 : 175);

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      const baseRadiusX = isFlat2D ? 72 : Math.min(w * 0.40, 145);
      const baseRadiusY = isFlat2D ? 72 : Math.min(h * 0.38, 52);
      const baseRadiusZ = isFlat2D ? 0 : 65;
      const cameraDist = 220;

      const totalPitch = isFlat2D ? 0 : (((cameraPitch * Math.PI) / 180) + dragRef.current.pitchOffset);
      const cosP = Math.cos(totalPitch);
      const sinP = Math.sin(totalPitch);

      if (isInProgress && count > 0) {
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = 1.0;

        particles.forEach((p) => {
          const rotAngle = getRotationAngle(p.angleOffset, elapsed, activeIcons.length) + dragRef.current.angleOffset;

          if (isFlat2D) {
            // Pure 2D XY rotation with ease and no Z depth
            const px = cx + p.flatRadius * Math.cos(rotAngle);
            const py = cy + p.flatRadius * Math.sin(rotAngle);

            if (px >= 2 && px <= w - 2 && py >= 2 && py <= h - 2) {
              ctx.beginPath();
              ctx.arc(px, py, baseParticleRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // 3D perspective rotation
            const x0 = baseRadiusX * p.radiusFactorX * Math.cos(rotAngle);
            const y0 = baseRadiusY * p.radiusFactorY * Math.sin(rotAngle);
            const z0 = (baseRadiusZ * Math.sin(rotAngle)) + p.zOffset;

            const y3d = y0 * cosP - z0 * sinP;
            const z3d = y0 * sinP + z0 * cosP;

            const perspectiveScale = cameraDist / (cameraDist - z3d);

            const px = cx + x0 * perspectiveScale;
            const py = cy + y3d * perspectiveScale;

            if (px >= 2 && px <= w - 2 && py >= 2 && py <= h - 2) {
              ctx.beginPath();
              ctx.arc(px, py, Math.max(0.6, baseParticleRadius * perspectiveScale), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isDark, isInProgress, starCount, speedMultiplier, randomZSpace, cameraPitch, isFlat2D, steppedMotion, activeIcons.length]);

  // Track positions of product icons (2D flat circular orbit vs 3D Z-space)
  const [iconStates, setIconStates] = useState<{
    type: ProductIconType;
    x: number;
    y: number;
    scale: number;
    zIndex: number;
  }[]>([]);

  useEffect(() => {
    let animId: number;
    let startTime = performance.now();
    let lastFrameTime = performance.now();

    const updateOrbit = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const dt = Math.max(0.001, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      // Apply drag momentum inertia decay
      if (!dragRef.current.isDragging) {
        dragRef.current.angleOffset += dragRef.current.vx * dt;
        dragRef.current.pitchOffset += dragRef.current.vy * dt;
        dragRef.current.vx *= 0.94;
        dragRef.current.vy *= 0.92;
      }

      const rect = containerRef.current?.getBoundingClientRect();
      const w = rect?.width || 320;
      const h = rect?.height || (isFlat2D ? 200 : 175);

      const cx = w / 2;
      const cy = h / 2;

      const baseRadiusX = isFlat2D ? 72 : Math.min(w * 0.40, 145);
      const baseRadiusY = isFlat2D ? 72 : Math.min(h * 0.38, 52);
      const baseRadiusZ = isFlat2D ? 0 : 70;
      const cameraDist = 220;

      const totalPitch = isFlat2D ? 0 : (((cameraPitch * Math.PI) / 180) + dragRef.current.pitchOffset);
      const cosP = Math.cos(totalPitch);
      const sinP = Math.sin(totalPitch);

      const count = activeIcons.length;

      const states = activeIcons.map((type, i) => {
        const iconPhase = (i * Math.PI * 2) / count;
        const angle = getRotationAngle(iconPhase, elapsed, count) + dragRef.current.angleOffset;

        if (isFlat2D) {
          // Pure 2D circular orbit with ease and without Z depth
          const x = cx + baseRadiusX * Math.cos(angle);
          const y = cy + baseRadiusY * Math.sin(angle);

          return {
            type,
            x,
            y,
            scale: 1.0,
            zIndex: 20,
          };
        }

        const x0 = baseRadiusX * Math.cos(angle);
        const y0 = baseRadiusY * Math.sin(angle);
        const z0 = baseRadiusZ * Math.sin(angle) + (randomZSpace ? Math.sin(i * 1.7) * 25 : 0);

        // 3D Pitch tilt rotation around X-axis
        const y3d = y0 * cosP - z0 * sinP;
        const z3d = y0 * sinP + z0 * cosP;

        const perspectiveScale = cameraDist / (cameraDist - z3d);

        const x = cx + x0 * perspectiveScale;
        const y = cy + y3d * perspectiveScale;

        const zIndex = z3d > 0 ? 30 : 10;

        return {
          type,
          x,
          y,
          scale: perspectiveScale,
          zIndex,
        };
      });

      setIconStates(states);
      animId = requestAnimationFrame(updateOrbit);
    };

    animId = requestAnimationFrame(updateOrbit);
    return () => cancelAnimationFrame(animId);
  }, [activeIcons, isInProgress, speedMultiplier, randomZSpace, cameraPitch, isFlat2D, steppedMotion]);

  return (
    <div 
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full ${isFlat2D ? 'h-[200px]' : 'h-[175px]'} bg-transparent overflow-hidden select-none flex items-center justify-center cursor-grab active:cursor-grabbing touch-none`}
    >
      {/* Background Canvas Circular Particles */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Orbiting Product Icons */}
      {iconStates.map((st, idx) => {
        return (
          <div
            key={`${st.type}-${idx}`}
            className="absolute top-0 left-0 transition-transform duration-75 ease-out pointer-events-none"
            style={{
              transform: `translate3d(${st.x - 16}px, ${st.y - 16}px, 0) scale(${st.scale})`,
              opacity: 1.0,
              zIndex: st.zIndex,
            }}
          >
            {/* Clean Rounded Icon Capsule or Freeform Vector Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              hasContainment
                ? (isDark 
                    ? 'bg-[#2b2d31] border border-[#383a3f] p-1.5 shadow-sm' 
                    : 'bg-white border border-[#e0e2e5] p-1.5 shadow-sm')
                : 'p-0.5 drop-shadow-sm'
            }`}>
              <div className="w-full h-full flex items-center justify-center">
                <ProductIcon type={st.type} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
