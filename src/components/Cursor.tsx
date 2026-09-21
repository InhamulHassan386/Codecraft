import { useEffect, useRef } from "react";

const TRAIL = 14; // trailing comet dots
const RING_EASE = 0.17; // how lazily the outer ring chases the pointer
const TRAIL_EASE = 0.34; // how lazily each trail dot chases the one ahead
const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary, .card-lift";

type Point = { x: number; y: number };

/* Custom cursor — a crisp blue core dot pinned to the real pointer, a soft ring
   that lags behind it, and a comet trail. Grows over links/buttons, pinches on
   click. Disabled entirely for touch devices and prefers-reduced-motion. */
export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    const wrap = wrapRef.current;
    const head = headRef.current;
    const ring = ringRef.current;
    if (!wrap || !head || !ring) return;

    const OFF = -200; // parked off-screen until the first real pointer move
    const target: Point = { x: OFF, y: OFF };
    const ringPos: Point = { x: OFF, y: OFF };
    const trail: Point[] = Array.from({ length: TRAIL }, () => ({ x: OFF, y: OFF }));

    let visible = false;
    let pressed = false;
    let hot = false;
    let raf = 0;

    const loop = () => {
      ringPos.x += (target.x - ringPos.x) * RING_EASE;
      ringPos.y += (target.y - ringPos.y) * RING_EASE;

      trail[0].x += (target.x - trail[0].x) * TRAIL_EASE;
      trail[0].y += (target.y - trail[0].y) * TRAIL_EASE;
      for (let i = 1; i < TRAIL; i++) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * TRAIL_EASE;
        trail[i].y += (trail[i - 1].y - trail[i].y) * TRAIL_EASE;
      }

      // Core rides exactly on the pointer so it never feels detached.
      head.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) scale(${
        pressed ? 0.55 : 1
      })`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) scale(${
        pressed ? 0.78 : hot ? 1.75 : 1
      })`;
      ring.style.borderColor = hot ? "rgba(37, 99, 235, 0.9)" : "rgba(37, 99, 235, 0.55)";

      for (let i = 0; i < TRAIL; i++) {
        const el = dotsRef.current[i];
        if (el) el.style.transform = `translate3d(${trail[i].x}px, ${trail[i].y}px, 0)`;
      }

      raf = requestAnimationFrame(loop);
    };

    const show = () => {
      if (visible) return;
      visible = true;
      wrap.style.opacity = "1";
      document.documentElement.classList.add("cc-hide-native");
    };

    const hide = () => {
      if (!visible) return;
      visible = false;
      hot = false;
      pressed = false;
      wrap.style.opacity = "0";
      document.documentElement.classList.remove("cc-hide-native");
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        // Snap everything onto the pointer so we don't streak in from the corner.
        ringPos.x = target.x;
        ringPos.y = target.y;
        for (const p of trail) {
          p.x = target.x;
          p.y = target.y;
        }
      }
      show();
    };

    const onOver = (e: MouseEvent) => {
      hot = (e.target as Element | null)?.closest?.(INTERACTIVE) !== null;
    };

    const onDown = () => {
      pressed = true;
    };
    const onUp = () => {
      pressed = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.classList.remove("cc-hide-native");
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-200"
      style={{ opacity: 0 }}
    >
      {/* Comet trail */}
      {Array.from({ length: TRAIL }).map((_, i) => {
        const t = 1 - i / TRAIL; // 1 at the head → ~0 at the tail
        const size = Math.round(11 * t + 3); // head ~14px, tail ~3px
        return (
          <div
            key={`t-${i}`}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            className="absolute left-0 top-0 rounded-full"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              backgroundColor: `rgba(37, 99, 235, ${0.2 + 0.6 * t})`,
              boxShadow: "0 0 10px rgba(37, 99, 235, 0.45)",
            }}
          />
        );
      })}

      {/* Lagging ring */}
      <div
        ref={ringRef}
        className="absolute left-0 top-0 rounded-full border-2 transition-[border-color] duration-200"
        style={{
          width: 34,
          height: 34,
          marginLeft: -17,
          marginTop: -17,
          borderColor: "rgba(37, 99, 235, 0.55)",
          boxShadow: "0 0 18px rgba(37, 99, 235, 0.25)",
        }}
      />

      {/* Core dot, pinned to the true pointer position */}
      <div
        ref={headRef}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: 10,
          height: 10,
          marginLeft: -5,
          marginTop: -5,
          backgroundColor: "#2563eb",
          boxShadow:
            "0 0 0 3px rgba(37, 99, 235, 0.22), 0 0 16px 4px rgba(37, 99, 235, 0.6)",
        }}
      />
    </div>
  );
}
