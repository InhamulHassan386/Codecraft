import { useEffect, useRef } from "react";

/* Mouse animation layer — adds three effects around the native pointer:
 *
 *   1. Sparkle trail  — twinkling stars scattered along the pointer path,
 *      drifting up and fading out.
 *   2. Click bursts   — an expanding ring plus sparks that fly outward on click.
 *   3. Magnetic hover — any element marked `data-magnetic` leans toward the
 *      pointer when it comes near, and springs back when it leaves.
 *
 * Everything animates with the Web Animations API and self-cleans, so there is
 * no per-frame bookkeeping. Disabled entirely for touch devices and for
 * prefers-reduced-motion. */

const SPARK_STEP = 26;        // px of pointer travel between trail sparkles
const SPARK_MAX = 48;         // live particle cap
const BURST_SPARKS = 8;       // sparks thrown outward per click
const MAGNET_STRENGTH = 0.32; // how hard a [data-magnetic] leans toward the pointer
const MAGNET_CLAMP = 14;      // px, max lean distance
const MAGNET_REACH_EXTRA = 30;

type Pt = { x: number; y: number };

/* Mostly brand blues, with the odd white twinkle and emerald accent. */
const SPARK_COLORS = [
  "#5b93ff", "#5b93ff", "#7aa5ff", "#7aa5ff", "#93c5fd", "#ffffff", "#34d399",
];

const STAR_CLIP =
  "polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%)";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pickColor = () => SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0];

export default function MouseAnimation() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    const layer = layerRef.current;
    if (!layer) return;

    const live = new Set<HTMLElement>();
    let last: Pt | null = null;
    let lastSparkAt = 0;

    /* ---------------- sparkles ---------------- */
    const spawnSparkle = (x: number, y: number, fx: number, fy: number, pop = 0.25) => {
      if (live.size >= SPARK_MAX) return;

      const el = document.createElement("div");
      const star = Math.random() < 0.55;
      const size = 4 + Math.random() * 6;
      el.style.cssText =
        `position:absolute;left:0;top:0;width:${size}px;height:${size}px;` +
        `margin-left:${-size / 2}px;margin-top:${-size / 2}px;` +
        `background:${pickColor()};box-shadow:0 0 8px rgba(91,147,255,.8);pointer-events:none;`;
      if (star) el.style.clipPath = STAR_CLIP;
      else el.style.borderRadius = "999px";
      layer.appendChild(el);
      live.add(el);

      const rot = (Math.random() - 0.5) * 200;
      const anim = el.animate(
        [
          { transform: `translate3d(${x}px, ${y}px, 0) scale(0) rotate(0deg)`, opacity: 0 },
          {
            transform: `translate3d(${x + fx * 0.35}px, ${y + fy * 0.35}px, 0) scale(1) rotate(${rot * 0.4}deg)`,
            opacity: 1,
            offset: pop,
          },
          {
            transform: `translate3d(${x + fx}px, ${y + fy}px, 0) scale(0) rotate(${rot}deg)`,
            opacity: 0,
          },
        ],
        { duration: 550 + Math.random() * 350, easing: "cubic-bezier(.22,1,.36,1)" },
      );
      anim.onfinish = () => {
        el.remove();
        live.delete(el);
      };
    };

    /* ---------------- click burst ---------------- */
    const spawnBurst = (x: number, y: number) => {
      // expanding ring
      const ring = document.createElement("div");
      const D = 28;
      ring.style.cssText =
        `position:absolute;left:0;top:0;width:${D}px;height:${D}px;` +
        `margin-left:${-D / 2}px;margin-top:${-D / 2}px;` +
        `border:2px solid rgba(91,147,255,.85);border-radius:999px;` +
        `pointer-events:none;box-shadow:0 0 14px rgba(37,99,235,.45);`;
      layer.appendChild(ring);
      live.add(ring);
      const ringAnim = ring.animate(
        [
          { transform: `translate3d(${x}px, ${y}px, 0) scale(.35)`, opacity: 0.9 },
          { transform: `translate3d(${x}px, ${y}px, 0) scale(2.6)`, opacity: 0 },
        ],
        { duration: 480, easing: "cubic-bezier(.16,1,.3,1)" },
      );
      ringAnim.onfinish = () => {
        ring.remove();
        live.delete(ring);
      };

      // sparks flying outward at evenly spread angles
      for (let i = 0; i < BURST_SPARKS; i++) {
        const angle = (i / BURST_SPARKS) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
        const dist = 20 + Math.random() * 22;
        spawnSparkle(x, y, Math.cos(angle) * dist, Math.sin(angle) * dist, 0.18);
      }
      // a little twinkle pop right at the click
      for (let i = 0; i < 3; i++) {
        spawnSparkle(
          x + (Math.random() - 0.5) * 12,
          y + (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 14,
          -6 - Math.random() * 10,
        );
      }
    };

    /* ---------------- magnetic hover ---------------- */
    let mags: HTMLElement[] = [];
    const collectMags = () => {
      mags = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    };
    collectMags();
    const mo = new MutationObserver(collectMags);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-magnetic"],
    });

    const release = (el: HTMLElement) => {
      el.classList.remove("magnet-near");
      el.style.transform = "";
    };

    const updateMagnets = (mx: number, my: number) => {
      for (const el of mags) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue; // detached or hidden
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const reach = Math.max(r.width, r.height) * 0.5 + MAGNET_REACH_EXTRA;
        const dist = Math.hypot(dx, dy);
        if (dist > reach) {
          if (el.classList.contains("magnet-near")) release(el);
          continue;
        }
        const pull = 1 - dist / reach; // stronger the closer the pointer is
        const tx = clamp(dx * MAGNET_STRENGTH, -MAGNET_CLAMP, MAGNET_CLAMP);
        const ty = clamp(dy * MAGNET_STRENGTH, -MAGNET_CLAMP, MAGNET_CLAMP);
        el.classList.add("magnet-near");
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1 + 0.03 * pull})`;
      }
    };

    const releaseAll = () => {
      for (const el of mags) if (el.classList.contains("magnet-near")) release(el);
    };

    /* ---------------- events ---------------- */
    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();

      if (last) {
        const d = Math.hypot(x - last.x, y - last.y);
        if (d >= SPARK_STEP && now - lastSparkAt > 28) {
          // Scatter sparkles along the segment actually travelled, not just at
          // the tip, so fast flicks leave a continuous trail.
          const n = Math.min(3, Math.floor(d / SPARK_STEP));
          for (let i = 0; i < n; i++) {
            const t = (i + 1) / (n + 1);
            spawnSparkle(
              last.x + (x - last.x) * t + (Math.random() - 0.5) * 10,
              last.y + (y - last.y) * t + (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 18,
              -6 - Math.random() * 14,
            );
          }
          lastSparkAt = now;
        }
      }
      last = { x, y };
      updateMagnets(x, y);
    };

    const onDown = (e: MouseEvent) => spawnBurst(e.clientX, e.clientY);

    const onLeave = () => {
      last = null;
      releaseAll();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("blur", onLeave);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("blur", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      mo.disconnect();
      releaseAll();
      for (const el of live) {
        el.getAnimations().forEach((a) => a.cancel());
        el.remove();
      }
      live.clear();
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
    />
  );
}
