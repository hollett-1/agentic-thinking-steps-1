"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const RenderTarget = {
    current: () => "preview",
    canvas: "canvas",
    export: "export",
    thumbnail: "thumbnail",
    preview: "preview",
}

// ── Transition helpers ───────────────────────────────────────────────────────
type TransitionValue = {
    type?: "tween" | "spring"
    duration?: number
    ease?: string | number[]
    [key: string]: unknown
}

// Evaluate a CSS cubic-bezier [x1,y1,x2,y2] as an (x in 0..1) => eased fn.
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
    const cx = 3 * x1
    const bx = 3 * (x2 - x1) - cx
    const ax = 1 - cx - bx
    const cy = 3 * y1
    const by = 3 * (y2 - y1) - cy
    const ay = 1 - cy - by
    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
    return (x: number): number => {
        if (x <= 0) return 0
        if (x >= 1) return 1
        let lo = 0
        let hi = 1
        let t = x
        for (let i = 0; i < 12; i++) {
            const mid = (lo + hi) / 2
            const sx = sampleX(mid)
            if (Math.abs(sx - x) < 1e-6) {
                t = mid
                break
            }
            if (sx < x) lo = mid
            else hi = mid
            t = mid
        }
        return sampleY(t)
    }
}

function resolveEasingFn(
    trans: TransitionValue | undefined
): (t: number) => number {
    const linear = (t: number) => t
    if (!trans || trans.type === "spring") return linear
    const ease = trans.ease
    if (
        Array.isArray(ease) &&
        ease.length === 4 &&
        ease.every((v) => typeof v === "number")
    ) {
        const [x1, y1, x2, y2] = ease as [number, number, number, number]
        return cubicBezier(x1, y1, x2, y2)
    }
    if (typeof ease === "string") {
        switch (ease) {
            case "easeIn":
            case "circIn":
                return (t) => t * t
            case "easeOut":
            case "circOut":
                return (t) => 1 - (1 - t) * (1 - t)
            case "easeInOut":
            case "circInOut":
                return (t) =>
                    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
            case "linear":
            default:
                return linear
        }
    }
    return linear
}

function resolveDuration(trans: TransitionValue | undefined): number {
    if (!trans || trans.type === "spring") return 1
    const d = trans.duration
    return typeof d === "number" && d > 0 ? d : 1
}

export type ParticleTextProps = {
    text?: string
    colors?: string[]
    mode?: "onEnter" | "onHover"
    replay?: boolean
    position?: "above" | "middle" | "below"
    particleSize?: number
    particleCount?: number
    mouseEnabled?: boolean
    mouseRadius?: number
    mouseForce?: number
    fontSize?: number
    autoFit?: boolean
    animateIn?: boolean
    transition?: TransitionValue
    style?: React.CSSProperties
}

const COMPONENT_DEFAULTS = {
    text: "PIXEL DRIFT",
    colors: ["#FFFFFF", "#1995FA", "#FFFFFF"],
    mode: "onEnter" as const,
    replay: true,
    position: "above" as const,
    particleSize: 12,
    particleCount: 50,
    mouseEnabled: true,
    mouseRadius: 50,
    mouseForce: 30,
    fontSize: 80,
    autoFit: false,
    animateIn: true,
    transition: { type: "tween" as const, duration: 0, ease: "linear" },
}

/**
 * ParticleText — text rendered as a malleable field of colored particles that
 * get displaced by the cursor like a black hole or energy field.
 * Highly responsive to real-time property changes without tearing down animations.
 */
export default function ParticleText(props: ParticleTextProps) {
    const merged = { ...COMPONENT_DEFAULTS, ...props }
    const {
        text,
        colors,
        mode,
        replay,
        position,
        particleSize,
        particleCount,
        mouseEnabled,
        mouseRadius,
        mouseForce,
        fontSize,
        autoFit,
        animateIn,
        transition,
        style,
    } = merged

    const containerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const pointerRef = useRef({ x: -99999, y: -99999, active: false })
    
    // Animated formation value 0→1 (0 = at spawn / invisible, 1 = fully formed).
    const formValRef = useRef(0)
    const lastFrameRef = useRef<number | null>(null)
    const hiddenRef = useRef(false)
    const reverseRef = useRef(false)
    const hasEnteredRef = useRef(false)

    // Store live props so real-time simulation updates without restarting effects
    const propsRef = useRef(merged)
    propsRef.current = merged

    const renderTarget = RenderTarget.current()
    const isStatic =
        renderTarget === RenderTarget.export ||
        renderTarget === RenderTarget.thumbnail

    const colorsKey = Array.isArray(colors) ? colors.join("|") : ""
    const transitionKey = JSON.stringify(transition ?? {})

    // Particle buffers stored in a mutable ref so sampling can update without effect teardown
    const buffersRef = useRef<{
        count: number
        ox: Float32Array
        oy: Float32Array
        sx: Float32Array
        sy: Float32Array
        px: Float32Array
        py: Float32Array
        repX: Float32Array
        repY: Float32Array
        cIdx: Uint8Array
        cssW: number
        cssH: number
        dpr: number
        palette: string[]
        buckets: number[][]
    }>({
        count: 0,
        ox: new Float32Array(0),
        oy: new Float32Array(0),
        sx: new Float32Array(0),
        sy: new Float32Array(0),
        px: new Float32Array(0),
        py: new Float32Array(0),
        repX: new Float32Array(0),
        repY: new Float32Array(0),
        cIdx: new Uint8Array(0),
        cssW: 0,
        cssH: 0,
        dpr: 1,
        palette: ["#40ffaa", "#40aaff", "#ff40aa", "#aa40ff"],
        buckets: [[]]
    })

    // Sampling function that generates particle targets from text offscreen
    const sampleText = useRef(() => {
        const container = containerRef.current
        const canvas = canvasRef.current
        if (!container || !canvas) return

        const b = buffersRef.current
        const W = b.cssW
        const H = b.cssH
        if (W <= 0 || H <= 0) {
            b.count = 0
            return
        }

        const p = propsRef.current
        const palette = Array.isArray(p.colors) && p.colors.length > 0
            ? p.colors
            : ["#40ffaa", "#40aaff", "#ff40aa", "#aa40ff"]
        b.palette = palette
        b.buckets = palette.map(() => [])

        const off = document.createElement("canvas")
        const fontFamily = 'Google Sans Text, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        const tmpCtx = off.getContext("2d", { willReadFrequently: true })
        if (!tmpCtx) return

        const maxW = W * 0.95
        const maxH = H * 0.92
        let effectiveSize = Math.max(13, p.fontSize)
        if (p.autoFit) {
            // Fit font size flexibly without clamping unnecessarily if W/H allow
            effectiveSize = fitFontSize(tmpCtx, p.text || "", fontFamily, maxW, maxH, Math.max(13, p.fontSize))
        }

        tmpCtx.font = `700 ${effectiveSize}px ${fontFamily}`
        const gm = tmpCtx.measureText(p.text || "")
        const gW = gm.width || 1

        const sampleW = Math.max(W, Math.ceil(gW + 30))
        off.width = Math.max(1, Math.floor(sampleW * b.dpr))
        off.height = Math.max(1, Math.floor(H * b.dpr))
        const offCtx = off.getContext("2d", { willReadFrequently: true })
        if (!offCtx) return
        offCtx.scale(b.dpr, b.dpr)

        offCtx.clearRect(0, 0, sampleW, H)
        offCtx.fillStyle = "#fff"
        offCtx.font = `700 ${effectiveSize}px ${fontFamily}`
        if (gW > maxW) {
            offCtx.textAlign = "left"
            offCtx.textBaseline = "middle"
            offCtx.fillText(p.text || "", 4, H / 2)
        } else {
            offCtx.textAlign = "center"
            offCtx.textBaseline = "middle"
            offCtx.fillText(p.text || "", W / 2, H / 2)
        }

        const img = offCtx.getImageData(0, 0, Math.floor(sampleW * b.dpr), Math.floor(H * b.dpr))
        const data = img.data

        const pCount = Math.max(1, Math.min(200, p.particleCount))
        const stride = Math.max(2, Math.round(140 / pCount))

        let candidates = 0
        for (let y = 0; y < H; y += stride) {
            for (let x = 0; x < sampleW; x += stride) {
                const ix = Math.floor(x * b.dpr)
                const iy = Math.floor(y * b.dpr)
                const idx = (iy * img.width + ix) * 4 + 3
                if (data[idx] > 128) candidates++
            }
        }

        const downsample = candidates > 30000 ? Math.ceil(candidates / 30000) : 1
        const allocCount = Math.min(candidates, 30000)

        const newOx = new Float32Array(allocCount)
        const newOy = new Float32Array(allocCount)
        const newSx = new Float32Array(allocCount)
        const newSy = new Float32Array(allocCount)
        const newPx = new Float32Array(allocCount)
        const newPy = new Float32Array(allocCount)
        const newC = new Uint8Array(allocCount)
        const newRepX = new Float32Array(allocCount)
        const newRepY = new Float32Array(allocCount)

        const alreadyEntered = hasEnteredRef.current && formValRef.current > 0

        let i = 0
        let seen = 0
        for (let y = 0; y < H && i < allocCount; y += stride) {
            for (let x = 0; x < sampleW && i < allocCount; x += stride) {
                const ix = Math.floor(x * b.dpr)
                const iy = Math.floor(y * b.dpr)
                const idx = (iy * img.width + ix) * 4 + 3
                if (data[idx] > 128) {
                    if (seen % downsample === 0) {
                        newOx[i] = x
                        newOy[i] = y
                        const ang = Math.random() * Math.PI * 2
                        const rad = Math.max(sampleW, H) * (0.6 + Math.random() * 0.5)
                        const rx = sampleW / 2 + Math.cos(ang) * rad
                        const ry = H / 2 + Math.sin(ang) * rad
                        newSx[i] = rx
                        newSy[i] = ry

                        // If already entered, place immediately at target or preserve settled position
                        if (alreadyEntered) {
                            newPx[i] = x
                            newPy[i] = y
                        } else {
                            newPx[i] = p.animateIn === false ? x : rx
                            newPy[i] = p.animateIn === false ? y : ry
                        }
                        newC[i] = Math.floor(Math.random() * palette.length)
                        i++
                    }
                    seen++
                }
            }
        }

        b.count = i
        b.ox = newOx
        b.oy = newOy
        b.sx = newSx
        b.sy = newSy
        b.px = newPx
        b.py = newPy
        b.repX = newRepX
        b.repY = newRepY
        b.cIdx = newC

        // Only reset formation animation on fresh mounts or if never entered
        if (!alreadyEntered) {
            formValRef.current = p.animateIn === false ? 1 : 0
            lastFrameRef.current = null
        }
    })

    function fitFontSize(
        measureCtx: CanvasRenderingContext2D,
        label: string,
        family: string,
        maxW: number,
        maxH: number,
        cap: number
    ) {
        if (!label) return cap
        let lo = 13
        let hi = Math.max(13, cap)
        let best = lo
        for (let iter = 0; iter < 12; iter++) {
            const mid = (lo + hi) / 2
            measureCtx.font = `700 ${mid}px ${family}`
            const m = measureCtx.measureText(label)
            const w = m.width
            const h =
                (m.actualBoundingBoxAscent || mid * 0.8) +
                (m.actualBoundingBoxDescent || mid * 0.2)
            if (w <= maxW && h <= maxH) {
                best = mid
                lo = mid
            } else {
                hi = mid
            }
        }
        return Math.max(13, Math.floor(best))
    }

    // Effect for handling sampling changes cleanly when layout/text/density changes
    useEffect(() => {
        sampleText.current()
    }, [text, fontSize, particleCount, autoFit, colorsKey])

    // Main lifecycle effect: setup canvas, event loop, and intersection triggers
    useEffect(() => {
        const container = containerRef.current
        const canvas = canvasRef.current
        if (!container || !canvas) return
        const ctx = canvas.getContext("2d", { alpha: true })
        if (!ctx) return

        let prevMx = -99999
        let prevMy = -99999
        let mouseSpeed = 0
        let smoothX = -99999
        let smoothY = -99999

        const resize = () => {
            const rect = container.getBoundingClientRect()
            const w = Math.floor(rect.width)
            const h = Math.floor(rect.height)
            if (w <= 0 || h <= 0) return
            const newDpr = Math.max(1, Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1))
            const b = buffersRef.current
            if (Math.abs(w - b.cssW) < 8 && Math.abs(h - b.cssH) < 8 && newDpr === b.dpr) return
            b.dpr = newDpr
            b.cssW = w
            b.cssH = h
            canvas.width = Math.floor(w * newDpr)
            canvas.height = Math.floor(h * newDpr)
            ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0)
            sampleText.current()
            if (isStatic) staticDraw()
        }

        resize()

        reverseRef.current = false
        hiddenRef.current = propsRef.current.animateIn === false ? false : true
        formValRef.current = propsRef.current.animateIn === false ? 1 : 0

        const formIn = () => {
            hasEnteredRef.current = true
            reverseRef.current = false
            hiddenRef.current = false
        }
        const formOut = () => {
            reverseRef.current = true
        }

        let tryEnter: (() => void) | null = null
        const enterTimers: ReturnType<typeof setTimeout>[] = []

        const ro = new ResizeObserver(() => {
            resize()
            if (isStatic) staticDraw()
            tryEnter?.()
        })
        ro.observe(container)

        const onMove = (e: PointerEvent) => {
            const p = propsRef.current
            if (!p.mouseEnabled) return
            const rect = canvas.getBoundingClientRect()
            if (rect.width <= 0 || rect.height <= 0) return
            const b = buffersRef.current
            const scaleX = b.cssW / rect.width
            const scaleY = b.cssH / rect.height
            const mx = (e.clientX - rect.left) * scaleX
            const my = (e.clientY - rect.top) * scaleY
            const rad = p.mouseRadius ?? 45
            const inRange = mx >= -rad * 1.5 && mx <= b.cssW + rad * 1.5 && my >= -rad * 1.5 && my <= b.cssH + rad * 1.5
            if (prevMx > -9000 && inRange) {
                const ddx = mx - prevMx
                const ddy = my - prevMy
                mouseSpeed = Math.sqrt(ddx * ddx + ddy * ddy)
            }
            prevMx = mx
            prevMy = my
            pointerRef.current.x = mx
            pointerRef.current.y = my
            pointerRef.current.active = inRange
        }

        const onLeave = () => {
            pointerRef.current.x = -99999
            pointerRef.current.y = -99999
            pointerRef.current.active = false
            prevMx = -99999
            prevMy = -99999
        }

        window.addEventListener("pointermove", onMove)
        canvas.addEventListener("pointerleave", onLeave)
        canvas.addEventListener("pointercancel", onLeave)

        let io: IntersectionObserver | null = null
        let sentinel: HTMLDivElement | null = null
        if (mode === "onHover") {
            container.addEventListener("pointerenter", formIn)
            container.addEventListener("pointerleave", formOut)
        } else {
            sentinel = document.createElement("div")
            sentinel.style.position = "absolute"
            sentinel.style.left = "0"
            sentinel.style.width = "1px"
            sentinel.style.height = "1px"
            sentinel.style.pointerEvents = "none"
            if (position === "middle") sentinel.style.top = "50%"
            else if (position === "below") sentinel.style.bottom = "0"
            else sentinel.style.top = "0"
            container.appendChild(sentinel)

            let entered = false
            const enter = () => {
                if (entered) return
                entered = true
                formIn()
                if (!replay) io?.disconnect()
            }
            tryEnter = () => {
                if (entered || typeof window === "undefined") return
                const r = container.getBoundingClientRect()
                if (r.width === 0 && r.height === 0) return
                const vh = window.innerHeight || 0
                const vw = window.innerWidth || 0
                const y = position === "middle" ? r.top + r.height / 2 : position === "below" ? r.bottom : r.top
                const onScreen = r.right >= 0 && r.left <= vw && r.bottom >= 0 && y <= vh
                if (onScreen) enter()
            }
            io = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        enter()
                    } else if (replay) {
                        entered = false
                        hiddenRef.current = true
                        reverseRef.current = false
                        formValRef.current = 0
                    }
                },
                { threshold: 0 }
            )
            io.observe(sentinel)
            tryEnter()
            enterTimers.push(
                setTimeout(() => tryEnter?.(), 60),
                setTimeout(() => tryEnter?.(), 250),
                setTimeout(() => tryEnter?.(), 600)
            )
        }

        const drawFrame = () => {
            const b = buffersRef.current
            ctx.clearRect(0, 0, b.cssW, b.cssH)

            const p = propsRef.current
            const pr = pointerRef.current
            const drawSize = Math.max(1, (p.particleSize ?? 12) / 4)
            const half = drawSize / 2

            const now = typeof performance !== "undefined" ? performance.now() : 0
            const last = lastFrameRef.current ?? now
            const dt = Math.min(64, Math.max(0, now - last))
            lastFrameRef.current = now
            const reverse = reverseRef.current
            const target = reverse ? 0 : 1

            const easeFn = resolveEasingFn(p.transition)
            const formMs = Math.max(0, resolveDuration(p.transition) * 1000)

            let v = formValRef.current
            if (isStatic || p.animateIn === false || formMs <= 0 || hasEnteredRef.current) {
                if (!reverse && hasEnteredRef.current && v < 1 && formMs <= 0) v = 1
                else if (formMs > 0 && v !== target) {
                    const stepv = dt / formMs
                    if (v < target) v = Math.min(target, v + stepv)
                    else if (v > target) v = Math.max(target, v - stepv)
                } else {
                    v = target
                }
            } else {
                const stepv = dt / formMs
                if (v < target) v = Math.min(target, v + stepv)
                else if (v > target) v = Math.max(target, v - stepv)
            }
            formValRef.current = v
            if (reverse && v <= 0) hiddenRef.current = true
            if (hiddenRef.current) return

            const forming = v < 1 && !hasEnteredRef.current
            const factor = easeFn(v)

            const hitSpeed = mouseSpeed
            mouseSpeed *= 0.88
            const active = !forming && p.mouseEnabled && pr.active
            if (active) {
                const lerpFactor = Math.max(0.08, 0.3 - hitSpeed * 0.006)
                if (smoothX < -9000) {
                    smoothX = pr.x
                    smoothY = pr.y
                } else {
                    smoothX += (pr.x - smoothX) * lerpFactor
                    smoothY += (pr.y - smoothY) * lerpFactor
                }
            } else {
                smoothX = -99999
                smoothY = -99999
            }
            const mx = smoothX
            const my = smoothY
            const repCutoff = Math.max(1, p.mouseRadius ?? 45)
            const repCutoffSq = repCutoff * repCutoff
            const rF = p.mouseForce ?? 6

            for (let bk = 0; bk < b.buckets.length; bk++) b.buckets[bk].length = 0

            for (let i = 0; i < b.count; i++) {
                const oxi = b.ox[i]
                const oyi = b.oy[i]

                if (forming) {
                    b.px[i] = b.sx[i] + (oxi - b.sx[i]) * factor
                    b.py[i] = b.sy[i] + (oyi - b.sy[i]) * factor
                    const bIdx = (b.cIdx[i] !== undefined && b.cIdx[i] < b.buckets.length) ? b.cIdx[i] : 0
                    b.buckets[bIdx]?.push(i)
                    continue
                }

                let inZone = false
                if (active) {
                    const dx = oxi - mx
                    const dy = oyi - my
                    const distSq = dx * dx + dy * dy
                    if (distSq > 0 && distSq < repCutoffSq) {
                        const dist = Math.sqrt(distSq)
                        const nx = dx / dist
                        const ny = dy / dist
                        const falloff = 1 - dist / repCutoff
                        const push = falloff * Math.max(8, hitSpeed) * rF * 0.04
                        b.repX[i] += nx * push
                        b.repY[i] += ny * push
                        const targetRepX = nx * (repCutoff - dist) * 0.35
                        const targetRepY = ny * (repCutoff - dist) * 0.35
                        b.repX[i] += (targetRepX - b.repX[i]) * 0.12
                        b.repY[i] += (targetRepY - b.repY[i]) * 0.12
                        inZone = true
                    }
                }
                if (!inZone) {
                    b.repX[i] *= 0.97
                    b.repY[i] *= 0.97
                }

                b.px[i] = oxi + b.repX[i]
                b.py[i] = oyi + b.repY[i]

                const bIdx = (b.cIdx[i] !== undefined && b.cIdx[i] < b.buckets.length) ? b.cIdx[i] : 0
                b.buckets[bIdx]?.push(i)
            }

            ctx.globalAlpha = forming ? Math.min(1, Math.max(0, factor)) : 1
            for (let bk = 0; bk < b.buckets.length; bk++) {
                const bucket = b.buckets[bk]
                if (bucket.length === 0) continue
                ctx.fillStyle = b.palette[bk] || "#FFFFFF"
                ctx.beginPath()
                for (let k = 0; k < bucket.length; k++) {
                    const i = bucket[k]
                    if (b.px[i] === undefined || b.py[i] === undefined || !isFinite(b.px[i]) || !isFinite(b.py[i])) continue
                    ctx.moveTo(b.px[i] + half, b.py[i])
                    ctx.arc(b.px[i], b.py[i], half, 0, Math.PI * 2)
                }
                ctx.fill()
            }
            ctx.globalAlpha = 1
        }

        const staticDraw = () => {
            const b = buffersRef.current
            hiddenRef.current = false
            reverseRef.current = false
            for (let i = 0; i < b.count; i++) {
                b.px[i] = b.ox[i]
                b.py[i] = b.oy[i]
            }
            drawFrame()
        }

        const removeTriggers = () => {
            container.removeEventListener("pointerenter", formIn)
            container.removeEventListener("pointerleave", formOut)
            io?.disconnect()
            sentinel?.remove()
            enterTimers.forEach(clearTimeout)
        }

        if (isStatic) {
            staticDraw()
            return () => {
                window.removeEventListener("pointermove", onMove)
                canvas.removeEventListener("pointerleave", onLeave)
                canvas.removeEventListener("pointercancel", onLeave)
                removeTriggers()
                ro.disconnect()
            }
        }

        const loop = () => {
            drawFrame()
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)

        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
            window.removeEventListener("pointermove", onMove)
            canvas.removeEventListener("pointerleave", onLeave)
            canvas.removeEventListener("pointercancel", onLeave)
            removeTriggers()
            ro.disconnect()
        }
    }, [mode, position, replay, isStatic])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                overflow: "hidden",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                }}
            />
        </div>
    )
}
