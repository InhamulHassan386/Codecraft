import { useEffect, useRef } from "react";

const TRAIL = 12;   // number of trailing dots
const EASE = 0.4;   // how fast each dot follows the one ahead

/* Glowing cursor trail — a bright blue head dot with a smooth
   comet-like trail of dots behind it. Works with mouse AND touch. */
export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const pts = Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 }));
    const target = { x: -100, y: -100 };
    let shown = false;
    let raf = 0;

    const loop = () => {
      pts[0].x += (target.x - pts[0].x) * EASE;
      pts[0].y += (target.y - pts[0].y) * EASE;
      for (let i = 1; i < TRAIL; i++) {
        pts[i].x += (pts[i - 1].x - pts[i].x) * EASE;
        pts[i].y += (pts[i - 1].y - pts[i].y) * EASE;
      }
      for (let i = 0; i < TRAIL; i++) {
        const el = dotsRef.current[i];
        if (el) el.style.transform = `translate3d(${pts[i].x}px, ${pts[i].y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const show = () => {
      if (!shown && wrapRef.current) {
        shown = true;
        wrapRef.current.style.opacity = "1";
      }
    };
    const hide = () => {
      shown = false;
      if (wrapRef.current) wrapRef.current.style.opacity = "0";
    };

    const onMouse = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) pts.forEach((p) => { p.x = target.x; p.y = target.y; });
      show();
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      target.x = t.clientX;
      target.y = t.clientY;
      if (!shown) pts.forEach((p) => { p.x = target.x; p.y = target.y; });
      show();
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mouseenter", show);

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.removeEventListener("mouseenter", show);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300"
      style={{ opacity: 0 }}
    >
      {Array.from({ length: TRAIL }).map((_, i) => {
        const t = 1 - i / TRAIL; // 1 → near 0 (tail)
        const size = Math.round(10 * t + 4); // head ~14px, tail ~4px
        return (
          <div
            key={i}
            ref={(el) => { dotsRef.current[i] = el; }}
            className="absolute left-0 top-0 rounded-full"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              backgroundColor: `rgba(37, 99, 235, ${0.25 + 0.75 * t})`,
              boxShadow: i === 0
                ? "0 0 16px 5px rgba(37, 99, 235, 0.65)"
                : "0 0 8px rgba(37, 99, 235, 0.35)",
            }}
          />
        );
      })}
    </div>
  );
}
