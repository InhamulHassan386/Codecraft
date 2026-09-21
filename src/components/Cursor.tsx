import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* Simple custom cursor: a blue dot that follows the mouse instantly,
   with a soft ring trailing behind on a smooth spring.
   Grows on links/buttons. Desktop (fine pointer) only. */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 300, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = e.target as HTMLElement | null;
      setHovering(!!el?.closest("a, button, [role='button'], input, select, textarea, label"));
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Center dot — follows instantly */}
      <motion.div
        style={{ x, y }}
        animate={{ opacity: visible ? 1 : 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-brand"
      />
      {/* Trailing ring — smooth spring follow, grows on interactive elements */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovering ? 1.7 : 1,
          backgroundColor: hovering ? "rgba(37, 99, 235, 0.08)" : "rgba(37, 99, 235, 0)",
        }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed left-0 top-0 z-[9998] -ml-[18px] -mt-[18px] h-9 w-9 rounded-full border border-brand/50"
      />
    </>
  );
}
