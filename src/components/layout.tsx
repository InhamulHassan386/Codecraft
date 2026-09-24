import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Globe, Smartphone, PenTool, Cpu, ShoppingBag, Sparkles, Cloud, ShieldCheck,
  Layout, Server, Database, Wrench, Search, Map, FlaskConical, Rocket, LifeBuoy,
  Users, Layers, BadgeCheck, Clock, HeartHandshake, Menu, X, ArrowRight,
  Mail, Phone, MapPin, ChevronRight, Star,
  Check, Upload, Send, Calendar, CheckCircle2,
} from "lucide-react";

export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" /></svg>
  );
}
export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.15c0 .3.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" /></svg>
  );
}
export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.43-4.92 8.43-9.94z" /></svg>
  );
}
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
  );
}
export function XSocialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.23l-4.88-6.38L6.5 22H3.34l7.24-8.28L1.6 2H8l4.41 5.83L18.9 2zm-1.1 18.1h1.72L7.28 3.8H5.44L17.8 20.1z" /></svg>
  );
}
import { navLinks } from "../data/content";
import { cn } from "../utils/cn";

/* ---------------- Icon map ---------------- */
const iconMap: Record<string, any> = {
  Code2, Globe, Smartphone, PenTool, Cpu, ShoppingBag, Sparkles, Cloud, ShieldCheck,
  Layout, Server, Database, Wrench, Search, Map, FlaskConical, Rocket, LifeBuoy,
  Users, Layers, BadgeCheck, Clock, HeartHandshake,
};
export function DynIcon({ name, className }: { name: string; className?: string }) {
  const C = iconMap[name] || Code2;
  return <C className={className} />;
}

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({ children, delay = 0, y = 26, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionHeading({
  eyebrow, title, sub, dark, align = "center",
}: { eyebrow: string; title: string; sub?: string; dark?: boolean; align?: "center" | "left" }) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      <Reveal>
        <span className={cn("section-eyebrow", dark && "on-dark", align === "center" && "justify-center")}>{eyebrow}</span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className={cn("font-display mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]", dark ? "text-white" : "text-charcoal")}>
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className={cn("mt-4 text-base sm:text-lg leading-relaxed", dark ? "text-slate-300/90" : "text-muted")}>{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- Animated counter ---------------- */
export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = (node: HTMLSpanElement | null) => node;
  const [started, setStarted] = useState(false);
  return (
    <motion.span
      ref={ref as any}
      className="tick"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        if (started) return;
        setStarted(true);
        const t0 = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.round(eased * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }}
    >
      {count}{suffix}
    </motion.span>
  );
}

/* ---------------- Logo ---------------- */
export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand shadow-blue transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
        <Code2 className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-ink" />
      </span>
      <span className="leading-none">
        <span className={cn("font-display block text-[17px] font-800 font-extrabold tracking-tight", dark ? "text-white" : "text-charcoal")}>
          CodeCraft<span className="text-brand"> Solutions</span>
        </span>
        <span className={cn("mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em]", dark ? "text-slate-400" : "text-muted")}>
          Software House
        </span>
      </span>
    </Link>
  );
}

/* ---------------- Quote context ---------------- */
const QuoteCtx = createContext<{ open: () => void; close: () => void; openWithService: (s: string) => void }>({ open: () => {}, close: () => {}, openWithService: () => {} });
export const useQuote = () => useContext(QuoteCtx);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetService, setPresetService] = useState("");
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const openWithService = (s: string) => { setPresetService(s); setIsOpen(true); };
  return (
    <QuoteCtx.Provider value={{ open, close, openWithService }}>
      {children}
      <QuoteModal isOpen={isOpen} onClose={close} presetService={presetService} />
    </QuoteCtx.Provider>
  );
}

/* ---------------- Navbar ---------------- */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useQuote();
  const location = useLocation();
  

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isHome = location.pathname === "/";
  const solid = scrolled || !isHome || mobileOpen;

  return (
    <>
      <header
        className={cn(
            "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          solid ? "border-b border-line bg-white/92 shadow-card backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        )}
        style={solid ? { background: "rgba(255,255,255,0.94)" } : undefined}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className={cn(!solid && "[&_span]:!text-white")}>
            <Logo dark={!solid} />
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.path}
                to={l.path}
                className={({ isActive }) => cn(
                  "link-underline rounded-md px-2.5 py-2 text-[13.5px] font-semibold transition-colors",
                  solid ? "text-charcoal/80 hover:text-charcoal" : "text-white/80 hover:text-white",
                  isActive && (solid ? "!text-brand" : "!text-white active")
                )}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <button
              onClick={open}
              className="btn-primary group flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              Get a Quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn("flex h-10 w-10 items-center justify-center rounded-lg border transition xl:hidden", solid ? "border-line text-charcoal" : "border-white/20 text-white")}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-sm xl:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <Logo dark={false} />
                <button onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-charcoal">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {navLinks.map((l, i) => (
                  <motion.div key={l.path} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <NavLink
                      to={l.path}
                      className={({ isActive }) => cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold",
                        isActive ? "bg-brand-light text-brand" : "text-charcoal hover:bg-paper"
                      )}
                    >
                      {l.label}
                      <ChevronRight className="h-4 w-4 opacity-40" />
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              <div className="border-t border-line p-5">
                <button onClick={() => { setMobileOpen(false); open(); }} className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold">
                  Get a Quote <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-xs text-muted">hello@codecraftsolutions.com</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={cn(isHome ? "h-0" : "h-[68px] lg:h-[68px]")} />
    </>
  );
}

/* ---------------- Footer ---------------- */
export function Footer() {
  const { open } = useQuote();
  return (
    <footer className="relative overflow-hidden bg-ink text-slate-300">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top CTA strip */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-10 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Ready to build something exceptional?</h3>
            <p className="mt-2 text-slate-400">Get a free consultation and project estimate within 24 hours.</p>
          </div>
          <button onClick={open} className="btn-primary group flex shrink-0 items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold">
            Start Your Project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          <div>
            <Logo dark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              CodeCraft Solutions is a full-cycle software house building websites, mobile apps and custom software for startups and enterprises worldwide.
            </p>
            <div className="mt-6 flex gap-2.5">
              {[
                { icon: LinkedinIcon, label: "LinkedIn" },
                { icon: GithubIcon, label: "GitHub" },
                { icon: FacebookIcon, label: "Facebook" },
                { icon: InstagramIcon, label: "Instagram" },
                { icon: XSocialIcon, label: "X" },
              ].map((s) => (
                <a key={s.label} href="#" aria-label={s.label} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-brand hover:bg-brand hover:text-white">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Quick Links</h4>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 lg:grid-cols-1">
              {navLinks.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-sm text-slate-400 transition hover:text-white hover:pl-1">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Services</h4>
            <ul className="mt-5 space-y-2.5">
              {["Web Development", "Mobile Development", "UI/UX Design", "Software Development", "E-Commerce", "AI & Automation"].map((s) => (
                <li key={s}>
                  <Link to="/services" className="text-sm text-slate-400 transition hover:text-white hover:pl-1">{s}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Contact</h4>
            <ul className="mt-5 space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-glow"><Mail className="h-4 w-4" /></span>
                <span>hello@codecraftsolutions.com<br /><span className="text-slate-500">support@codecraftsolutions.com</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-glow"><Phone className="h-4 w-4" /></span>
                <span>+1 (555) 012-3456<br /><span className="text-slate-500">Mon–Fri, 9am–6pm EST</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-glow"><MapPin className="h-4 w-4" /></span>
                <span>100 Tech Avenue, Suite 400<br />Austin, TX 78701, USA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-[13px] text-slate-500 sm:flex-row">
          <p>© 2026 CodeCraft Solutions. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition hover:text-white">Privacy Policy</a>
            <a href="#" className="transition hover:text-white">Terms & Conditions</a>
            <Link to="/admin" className="transition hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Page hero for inner pages ---------------- */
export function PageHero({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-14 sm:pb-20 sm:pt-20">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="bg-grid-dark pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-brand/10 blur-[100px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="section-eyebrow on-dark">{eyebrow}</span>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-white text-balance sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{sub}</p>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- CTA section ---------------- */
export function CTASection() {
  const { open } = useQuote();
  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-24">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="bg-grid-dark pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[130px]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-blue">
            <Rocket className="h-6 w-6 text-white" />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white text-balance sm:text-5xl">
            Have a Project in Mind? Let's Build It Together.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            Tell us about your idea and our team will help turn it into a powerful digital solution.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={open} className="btn-primary group flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold">
              Get a Quote <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link to="/portfolio" className="btn-ghost-dark flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold">
              View Our Work
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-slate-400">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Free consultation</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> Response within 24 hours</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-400" /> NDA on request</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Star rating ---------------- */
export function Stars({ n = 5, className }: { n?: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-4 w-4", i < n ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />
      ))}
    </div>
  );
}

/* ---------------- Quote modal ---------------- */
const inputCls = "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-muted-2 transition";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-charcoal";

function QuoteModal({ isOpen, onClose, presetService }: { isOpen: boolean; onClose: () => void; presetService: string }) {
  const [sent, setSent] = useState(false);
  const [service, setService] = useState(presetService);
  const [fileName, setFileName] = useState("");

  useEffect(() => { if (presetService) setService(presetService); }, [presetService, isOpen]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);
  useEffect(() => { if (!isOpen) { setSent(false); } }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            {!sent ? (
              <>
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
                  <div>
                    <span className="section-eyebrow">Get a Quote</span>
                    <h3 className="font-display mt-1.5 text-xl font-extrabold text-charcoal sm:text-2xl">Tell us about your project</h3>
                    <p className="mt-1 text-sm text-muted">We reply with an estimate within 24 hours.</p>
                  </div>
                  <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper text-charcoal transition hover:bg-paper-2">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form
                  className="grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-8 sm:py-7"
                  onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                >
                  <div><label className={labelCls}>Full Name *</label><input required placeholder="John Smith" className={inputCls} /></div>
                  <div><label className={labelCls}>Email *</label><input required type="email" placeholder="john@company.com" className={inputCls} /></div>
                  <div><label className={labelCls}>Phone</label><input placeholder="+1 (555) 000-0000" className={inputCls} /></div>
                  <div><label className={labelCls}>Company</label><input placeholder="Company Inc." className={inputCls} /></div>
                  <div>
                    <label className={labelCls}>Project Type *</label>
                    <select required className={inputCls} defaultValue="">
                      <option value="" disabled>Select project type</option>
                      <option>New Project</option><option>Redesign / Rebuild</option><option>Ongoing Support</option><option>Consulting</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Required Service *</label>
                    <select required className={inputCls} value={service} onChange={(e) => setService(e.target.value)}>
                      <option value="" disabled>Select a service</option>
                      {["Web Development", "Mobile App Development", "UI/UX Design", "Software Development", "E-Commerce Development", "AI & Automation", "Cloud Solutions", "Maintenance & Support"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Budget *</label>
                    <select required className={inputCls} defaultValue="">
                      <option value="" disabled>Select budget range</option>
                      <option>Under $5,000</option><option>$5,000 – $10,000</option><option>$10,000 – $25,000</option><option>$25,000 – $50,000</option><option>$50,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Deadline</label>
                    <select className={inputCls} defaultValue="">
                      <option value="" disabled>Select timeline</option>
                      <option>ASAP</option><option>1–2 months</option><option>3–6 months</option><option>Flexible</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Project Details *</label>
                    <textarea required rows={4} placeholder="Describe your goals, features, timeline and anything else that helps us understand your project..." className={cn(inputCls, "resize-none")} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Attach Files <span className="font-normal text-muted">(brief, wireframes, docs — optional)</span></label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper px-4 py-4 text-sm font-medium text-muted transition hover:border-brand hover:bg-brand-light hover:text-brand">
                      <Upload className="h-4 w-4" />
                      {fileName || "Choose files or drag & drop here"}
                      <input type="file" multiple className="hidden" onChange={(e) => setFileName(e.target.files?.length ? `${e.target.files.length} file(s) selected` : "")} />
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-1.5 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Your information is confidential & NDA-protected.</p>
                    <button type="submit" className="btn-primary flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold">
                      Submit Request <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="px-6 py-14 text-center sm:px-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </motion.div>
                <h3 className="font-display mt-5 text-2xl font-extrabold text-charcoal">Request received!</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Thank you for considering CodeCraft Solutions. Our team will review your project and get back to you within 24 hours with next steps.
                </p>
                <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-xl bg-paper p-4 text-left text-sm">
                  <Calendar className="h-8 w-8 shrink-0 text-brand" />
                  <p className="text-charcoal"><span className="font-semibold">What happens next?</span><br /><span className="text-muted">A project manager will schedule a free 30-min discovery call.</span></p>
                </div>
                <button onClick={onClose} className="mt-7 rounded-xl bg-ink px-8 py-3 text-sm font-semibold text-white transition hover:bg-ink-3">Close</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Misc shared ---------------- */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return null;
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white shadow-dark-card transition hover:bg-brand"
          aria-label="Back to top"
        >
          <ChevronRight className="h-5 w-5 -rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

