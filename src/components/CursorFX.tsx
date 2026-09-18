import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  CursorFX — advanced mouse experience for the whole site            */
/*                                                                    */
/*  · Instant dot + spring-physics trailing ring (mix-blend difference, */
/*    auto-inverts over light/dark sections)                           */
/*  · Canvas particle trail with constellation links, additive glow    */
/*    that follows the cursor, and a burst on every click              */
/*  · Magnetic attraction on buttons & links                           */
/*  · data-cursor="Label" → ring morphs into a labelled badge          */
/*    (project cards → "View", blog cards → "Read")                    */
/*  · Morphs away over text fields (native caret restored)             */
/*                                                                    */
/*  Auto-disabled on touch devices and prefers-reduced-motion.         */
/* ------------------------------------------------------------------ */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: number;
  light: number;
};

type Mode = "default" | "hover" | "label" | "text";

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor]';
const MAGNETIC = 'a, button, [role="button"], [data-magnetic]';
const TEXTFIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea';
const HUES = [217, 210, 199, 258]; // brand blue, sky, cyan, violet

export default function CursorFX() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const canvas = canvasRef.current;
    if (!dot || !ring || !label || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.documentElement.classList.add("has-cursor-fx");

    /* ---------- canvas sizing ---------- */
    const fitCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fitCanvas();

    /* ---------- state ---------- */
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, seen: false, down: false };
    const dotP = { x: mouse.x, y: mouse.y, s: 1 };
    const ringP = { x: mouse.x, y: mouse.y, s: 1 };
    const lastSpawn = { x: mouse.x, y: mouse.y };
    let particles: Particle[] = [];
    let mode: Mode = "default";
    let curLabel = "";
    let visible = false;
    let mag: { el: HTMLElement; ox: number; oy: number; active: boolean } | null = null;
    let raf = 0;

    const setVisible = (v: boolean) => {
      if (visible === v) return;
      visible = v;
      for (const el of [canvas, ring, dot]) el.style.opacity = v ? "1" : "0";
    };

    const setMode = (next: Mode, text = "") => {
      if (next === mode && text === curLabel) return;
      mode = next;
      curLabel = text;
      ring.classList.toggle("is-label", next === "label");
      label.textContent = next === "label" ? text : "";
    };

    /* ---------- particles ---------- */
    const spawn = (n: number, sx: number, sy: number, spread: number, speed: number) => {
      for (let i = 0; i < n; i++) {
        if (particles.length > 220) return;
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.3 + Math.random() * 0.7);
        particles.push({
          x: sx + (Math.random() - 0.5) * spread,
          y: sy + (Math.random() - 0.5) * spread,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 0.25,
          life: 0,
          max: 38 + Math.random() * 30,
          size: 1.2 + Math.random() * 2.4,
          hue: HUES[(Math.random() * HUES.length) | 0],
          light: 55 + Math.random() * 20,
        });
      }
    };

    /* ---------- event handlers ---------- */
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.x;
      const dy = e.clientY - mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.seen) {
        mouse.seen = true;
        dotP.x = ringP.x = mouse.x;
        dotP.y = ringP.y = mouse.y;
        lastSpawn.x = mouse.x;
        lastSpawn.y = mouse.y;
        setVisible(true);
        return;
      }
      const dist = Math.hypot(dx, dy);
      if (dist > 16) {
        // spawn slightly behind the movement for a trailing feel
        spawn(2, mouse.x - dx * 0.4, mouse.y - dy * 0.4, 10, Math.min(dist * 0.055, 1.8));
        lastSpawn.x = mouse.x;
        lastSpawn.y = mouse.y;
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      if (t.closest(TEXTFIELD)) return setMode("text");
      const labeled = t.closest("[data-cursor]");
      if (labeled) return setMode("label", labeled.getAttribute("data-cursor") || "");
      if (t.closest(INTERACTIVE)) return setMode("hover");
      setMode("default");
    };

    const onOverMag = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      const el = (t?.closest(MAGNETIC) as HTMLElement | null) ?? null;
      if (!el || el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
      if (el === mag?.el) {
        mag.active = true;
        return;
      }
      if (el.getBoundingClientRect().width > 300) return; // controls only, not cards
      if (mag && mag.active) mag.active = false;
      mag = { el, ox: 0, oy: 0, active: true };
    };

    const onOutMag = (e: MouseEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      const el = t?.closest(MAGNETIC);
      if (mag && el === mag.el) mag.active = false;
    };

    const onDown = (e: MouseEvent) => {
      mouse.down = true;
      if (mouse.seen) spawn(16, e.clientX, e.clientY, 6, 3.4);
    };
    const onUp = () => {
      mouse.down = false;
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => {
      if (mouse.seen) setVisible(true);
    };

    /* ---------- render loop ---------- */
    const drawCanvas = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (!mouse.seen) return;
      ctx.globalCompositeOperation = "lighter";

      // ambient glow trailing the ring
      const g = ctx.createRadialGradient(ringP.x, ringP.y, 0, ringP.x, ringP.y, 230);
      g.addColorStop(0, "rgba(37, 99, 235, 0.07)");
      g.addColorStop(0.5, "rgba(37, 99, 235, 0.028)");
      g.addColorStop(1, "rgba(37, 99, 235, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(ringP.x - 230, ringP.y - 230, 460, 460);

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.955;
        p.vy = p.vy * 0.955 - 0.006; // gentle upward drift
        if (p.life >= p.max) {
          particles.splice(i, 1);
          continue;
        }
        const t = 1 - p.life / p.max;
        const a = t * t;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 92%, ${p.light}%, ${(a * 0.5).toFixed(3)})`;
        ctx.arc(p.x, p.y, p.size * (0.5 + t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }

      // constellation links between nearby particles
      if (particles.length > 1) {
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 8100) {
              const alpha = (1 - Math.sqrt(d2) / 90) * 0.1;
              ctx.strokeStyle = `hsla(217, 92%, 62%, ${alpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const press = mouse.down && mode !== "text" ? 0.82 : 1;
      const ringTarget = mode === "text" ? 0 : mode === "hover" ? 1.6 : 1;
      const dotTarget = mode === "text" ? 0 : mode === "hover" ? 0.4 : mouse.down ? 1.7 : 1;

      dotP.x += (mouse.x - dotP.x) * 0.55;
      dotP.y += (mouse.y - dotP.y) * 0.55;
      dotP.s += (dotTarget - dotP.s) * 0.2;

      ringP.x += (mouse.x - ringP.x) * 0.16;
      ringP.y += (mouse.y - ringP.y) * 0.16;
      ringP.s += (ringTarget * press - ringP.s) * 0.14;

      dot.style.transform = `translate3d(${dotP.x.toFixed(2)}px, ${dotP.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${dotP.s.toFixed(3)})`;
      ring.style.transform = `translate3d(${ringP.x.toFixed(2)}px, ${ringP.y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${ringP.s.toFixed(3)})`;

      // magnetic pull
      if (mag) {
        const r = mag.el.getBoundingClientRect();
        let tx = 0;
        let ty = 0;
        if (mag.active) {
          tx = Math.max(-14, Math.min(14, (mouse.x - (r.left + r.width / 2)) * 0.28));
          ty = Math.max(-14, Math.min(14, (mouse.y - (r.top + r.height / 2)) * 0.28));
        }
        mag.ox += (tx - mag.ox) * 0.22;
        mag.oy += (ty - mag.oy) * 0.22;
        if (!mag.active && Math.abs(mag.ox) < 0.08 && Math.abs(mag.oy) < 0.08) {
          mag.el.style.transform = "";
          mag = null;
        } else {
          mag.el.style.transform = `translate3d(${mag.ox.toFixed(2)}px, ${mag.oy.toFixed(2)}px, 0)`;
        }
      }

      drawCanvas();
    };
    raf = requestAnimationFrame(tick);

    /* ---------- listeners ---------- */
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseover", onOverMag, { passive: true });
    window.addEventListener("mouseout", onOutMag, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    window.addEventListener("resize", fitCanvas);

    /* ---------- cleanup ---------- */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseover", onOverMag);
      window.removeEventListener("mouseout", onOutMag);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("resize", fitCanvas);
      document.documentElement.classList.remove("has-cursor-fx");
      if (mag?.el) mag.el.style.transform = "";
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="cursor-fx-canvas" aria-hidden="true" />
      <div ref={ringRef} className="cursor-fx-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-fx-label" />
      </div>
      <div ref={dotRef} className="cursor-fx-dot" aria-hidden="true" />
    </>
  );
}
