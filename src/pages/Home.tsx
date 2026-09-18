import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Cloud, Code2,
  FolderKanban, Play, Quote, ShieldCheck, Star, Terminal, Zap, Globe, Smartphone, Database, Wrench, Layout, Server,
} from "lucide-react";
import { services, projects, techCategories, team, testimonials, blogPosts, processSteps, whyChooseUs, IMAGES } from "../data/content";
import { Reveal, SectionHeading, Counter, DynIcon, Stars, CTASection, useQuote } from "../components/layout";
import { cn } from "../utils/cn";

/* ================= HERO ================= */
function Hero() {
  const { open } = useQuote();
  const [, setTyped] = useState(0);
  const codeLines = [
    { n: 1, html: <span><span className="text-[#7aa5ff]">const</span> <span className="text-white">product</span> <span className="text-slate-500">=</span> <span className="text-[#7aa5ff]">await</span> <span className="text-emerald-300">codecraft.build</span><span className="text-slate-400">({"{"}</span></span> },
    { n: 2, html: <span><span className="text-slate-400">{"  "}type:</span> <span className="text-amber-300">"web-platform"</span><span className="text-slate-400">,</span></span> },
    { n: 3, html: <span><span className="text-slate-400">{"  "}stack:</span> <span className="text-amber-300">["react", "node", "ai"]</span><span className="text-slate-400">,</span></span> },
    { n: 4, html: <span><span className="text-slate-400">{"  "}quality:</span> <span className="text-amber-300">"enterprise"</span></span> },
    { n: 5, html: <span><span className="text-slate-400">{"}"});</span> <span className="text-slate-600">{"// shipped on time ✓"}</span></span> },
  ];
  useEffect(() => {
    const t = setInterval(() => setTyped((p) => (p + 1) % 40), 120);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="bg-grid-dark pointer-events-none absolute inset-0 animate-grid-pan" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[480px] w-[480px] rounded-full bg-brand/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[130px]" />

      {/* floating orbs */}
      <div className="pointer-events-none absolute left-[8%] top-[22%] hidden lg:block">
        <div className="h-2 w-2 rounded-full bg-brand-glow animate-pulse-glow" />
      </div>
      <div className="pointer-events-none absolute right-[12%] top-[16%] hidden lg:block">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:pb-24 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* Copy */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-[12.5px] font-semibold text-slate-200 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Trusted by 30+ clients worldwide
                <span className="hidden text-slate-500 sm:inline">•</span>
                <span className="hidden items-center gap-0.5 sm:flex">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  <span className="ml-1 text-slate-300">5.0 rated</span>
                </span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-white text-balance sm:text-5xl lg:text-[3.7rem]"
            >
              We Build Digital Solutions That{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#5b93ff] via-brand-glow to-[#5b93ff] bg-clip-text text-transparent">Move Businesses</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none"><path d="M2 9C80 3 200 3 298 9" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" opacity="0.6" /></svg>
              </span>{" "}
              Forward.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-slate-300/95 sm:text-lg"
            >
              CodeCraft Solutions delivers modern websites, mobile applications and custom software solutions designed to help businesses grow, innovate and succeed in the digital world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <button onClick={open} className="btn-primary group flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold">
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link to="/portfolio" className="btn-ghost-dark group flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold">
                <Play className="h-4 w-4 fill-current" /> View Our Work
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] font-medium text-slate-400"
            >
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 50+ projects delivered</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 96% on-time delivery</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> NDA & IP protection</span>
            </motion.div>
          </div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, delay: 0.25 }}
            className="relative mx-auto w-full max-w-[560px]"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-[28px] bg-brand/10 blur-3xl" />
            {/* Code window */}
            <div className="code-window relative overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-400">
                  <Terminal className="h-3 w-3" /> deploy — codecraft.studio
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" /> Live
                </div>
              </div>
              <div className="grid sm:grid-cols-[1fr_150px]">
                <div className="p-5 font-mono text-[12.5px] leading-[1.9]">
                  {codeLines.map((l) => (
                    <div key={l.n} className="flex gap-3">
                      <span className="w-4 select-none text-slate-600">{l.n}</span>
                      <span className="whitespace-pre">{l.html}</span>
                    </div>
                  ))}
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-2 font-sans text-[12px] font-semibold text-emerald-300">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20"><Check className="h-3 w-3" /></span>
                    Build successful · deployed in 4.2s
                    <span className="ml-auto font-mono text-emerald-400/70 animate-blink">▊</span>
                  </div>
                </div>
                {/* deploy stats */}
                <div className="hidden flex-col gap-2 border-l border-white/8 bg-white/[0.02] p-4 sm:flex">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Pipeline</p>
                  {[
                    { l: "Uptime", v: "99.98%", c: "text-emerald-400" },
                    { l: "Tests", v: "1,284 ✓", c: "text-emerald-400" },
                    { l: "Coverage", v: "94%", c: "text-[#7aa5ff]" },
                    { l: "Perf", v: "98/100", c: "text-amber-300" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2">
                      <p className="text-[10px] font-medium text-slate-500">{s.l}</p>
                      <p className={cn("font-mono text-[13px] font-semibold", s.c)}>{s.v}</p>
                    </div>
                  ))}
                  <div className="mt-auto">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-brand to-emerald-400" />
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-500">Deploying… 92%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* floating cards */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-4 top-16 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#131b26]/95 p-3 pr-5 shadow-dark-card backdrop-blur sm:flex lg:-left-10">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand shadow-blue"><Zap className="h-5 w-5 text-white" /></span>
              <span><span className="block text-[13px] font-bold text-white">AI-Powered</span><span className="block text-[11px] text-slate-400">Automation ready</span></span>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-3 top-1/2 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#131b26]/95 p-3 pr-5 shadow-dark-card backdrop-blur sm:flex lg:-right-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500"><ShieldCheck className="h-5 w-5 text-white" /></span>
              <span><span className="block text-[13px] font-bold text-white">Secure by Design</span><span className="block text-[11px] text-slate-400">OWASP aligned</span></span>
            </motion.div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -bottom-5 left-8 hidden items-center gap-3 rounded-2xl border border-white/10 bg-[#131b26]/95 p-3 pr-5 shadow-dark-card backdrop-blur sm:flex">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500"><Cloud className="h-5 w-5 text-white" /></span>
              <span><span className="block text-[13px] font-bold text-white">Cloud Native</span><span className="block text-[11px] text-slate-400">Auto-scaling infra</span></span>
            </motion.div>
          </motion.div>
        </div>

        {/* Trusted strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-14 border-t border-white/10 pt-7 lg:mt-20">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Powering digital products for forward-thinking teams</p>
          <div className="mask-fade-x mt-5 overflow-hidden">
            <div className="flex w-max animate-marquee gap-12 pr-12">
              {[...["NOVAPAY", "MEDICONNECT", "LUMINA", "ORBIT", "AURA BANK", "FOODFLEET", "EDUSPARK", "SENTINEL"], ...["NOVAPAY", "MEDICONNECT", "LUMINA", "ORBIT", "AURA BANK", "FOODFLEET", "EDUSPARK", "SENTINEL"]].map((b, i) => (
                <span key={i} className="font-display flex items-center gap-2.5 whitespace-nowrap text-[15px] font-extrabold tracking-[0.14em] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand/60" />{b}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ================= STATS ================= */
function Stats() {
  const stats = [
    { icon: FolderKanban, value: 50, suffix: "+", label: "Projects Completed" },
    { icon: Star, value: 30, suffix: "+", label: "Happy Clients" },
    { icon: Code2, value: 15, suffix: "+", label: "Team Members" },
    { icon: ShieldCheck, value: 5, suffix: "+", label: "Years of Experience" },
  ];
  return (
    <section className="relative z-10 border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="flex items-center gap-4 px-2 py-7 sm:px-6 lg:justify-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <s.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="font-display block text-2xl font-extrabold text-charcoal sm:text-[28px]"><Counter value={s.value} suffix={s.suffix} /></span>
                  <span className="block text-[13px] font-medium text-muted">{s.label}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= SERVICES ================= */
function Services() {
  const { openWithService } = useQuote();
  return (
    <section className="bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Our Services" title="What We Do" sub="Technology solutions designed around your business goals." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 4) * 0.07}>
              <div className="card-lift group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white transition-colors duration-300 group-hover:bg-brand group-hover:shadow-blue">
                  <DynIcon name={s.icon} className="h-[22px] w-[22px]" />
                </span>
                <h3 className="font-display mt-5 text-[17px] font-bold text-charcoal">{s.title}</h3>
                <p className="mt-1 text-[13px] font-semibold text-brand">{s.tagline}</p>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{s.description.slice(0, 110)}…</p>
                <button onClick={() => openWithService(s.title)} className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-charcoal transition group-hover:text-brand">
                  Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/services" className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-7 py-3.5 text-sm font-semibold text-charcoal shadow-card transition hover:border-brand hover:text-brand">
            Explore All Services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= WHY CHOOSE US ================= */
function WhyChoose() {
  const { open } = useQuote();
  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-24">
      <div className="hero-glow pointer-events-none absolute inset-0" />
      <div className="bg-grid-dark pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading dark align="left" eyebrow="Why Us" title="Why Choose CodeCraft Solutions?" sub="We're not just developers — we're a product partner invested in your outcome. Here's what makes teams stay with us for years." />
            <Reveal delay={0.2}>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="font-display text-3xl font-extrabold text-white"><Counter value={96} suffix="%" /></p>
                  <p className="mt-1 text-[13px] text-slate-400">On-time delivery rate</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="font-display text-3xl font-extrabold text-white"><Counter value={98} suffix="%" /></p>
                  <p className="mt-1 text-[13px] text-slate-400">Client satisfaction</p>
                </div>
              </div>
              <button onClick={open} className="btn-primary mt-6 flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold">
                Work With Us <ArrowRight className="h-4 w-4" />
              </button>
            </Reveal>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {whyChooseUs.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 0.08}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-brand/60 hover:bg-white/[0.07]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-[#7aa5ff] transition group-hover:bg-brand group-hover:text-white group-hover:shadow-blue">
                    <DynIcon name={w.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="font-display mt-4 text-[16px] font-bold text-white">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= TECHNOLOGIES PREVIEW ================= */
function TechPreview() {
  const [active, setActive] = useState(0);
  const catIcons = [Layout, Server, Smartphone, Database, Wrench];
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Our Stack" title="Technologies We Work With" sub="Battle-tested tools, chosen for performance, security and long-term maintainability." />
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {techCategories.map((c, i) => {
              const Icon = catIcons[i % catIcons.length];
              return (
                <button
                  key={c.title}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition",
                    active === i ? "border-brand bg-brand text-white shadow-blue" : "border-line bg-white text-charcoal hover:border-brand/50"
                  )}
                >
                  <Icon className="h-4 w-4" /> {c.title}
                </button>
              );
            })}
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {techCategories[active].items.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.07}>
              <div className="card-lift rounded-2xl border border-line bg-paper p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink font-mono text-[15px] font-bold text-white">
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand shadow-card">{t.level}%</span>
                </div>
                <h3 className="font-display mt-4 text-[16px] font-bold text-charcoal">{t.name}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-2">
                  <motion.div
                    key={active + t.name}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${t.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-glow"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/technologies" className="inline-flex items-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-brand">
            View All Technologies <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FEATURED WORK ================= */
const filters = ["All", "Web", "Mobile", "UI/UX", "Software", "E-Commerce"];
export function ProjectCard({ p, large }: { p: (typeof projects)[number]; large?: boolean }) {
  return (
    <div className="card-lift group overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className={cn("relative overflow-hidden", large ? "h-60 sm:h-72" : "h-52")}>
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-charcoal shadow-card">{p.category}</span>
        <span className="absolute bottom-4 left-4 rounded-lg bg-ink/80 px-3 py-1.5 font-mono text-[11px] font-semibold text-white backdrop-blur">{p.year} • {p.duration}</span>
      </div>
      <div className="p-6">
        <h3 className="font-display text-lg font-bold text-charcoal transition group-hover:text-brand">{p.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.technologies.map((t) => (
            <span key={t} className="rounded-md bg-paper px-2.5 py-1 text-[11.5px] font-semibold text-charcoal/70">{t}</span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <div className="flex gap-5">
            {p.results.slice(0, 2).map((r) => (
              <span key={r.label}><span className="font-display block text-[16px] font-extrabold text-brand">{r.value}</span><span className="block text-[11px] font-medium text-muted">{r.label}</span></span>
            ))}
          </div>
          <Link to={`/portfolio`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition group-hover:bg-brand">
            <ArrowUpRight className="h-4.5 w-4.5 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturedWork() {
  const [filter, setFilter] = useState("All");
  const list = (filter === "All" ? projects : projects.filter((p) => p.category === filter)).slice(0, 3);
  return (
    <section className="bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Portfolio" title="Featured Work" sub="A selection of solutions we've built for modern businesses." />
        <Reveal delay={0.1}>
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-5 py-2 text-[13px] font-semibold transition",
                  filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-charcoal/70 hover:border-charcoal"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>
        <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <ProjectCard p={p} />
            </motion.div>
          ))}
        </motion.div>
        <Reveal className="mt-10 text-center">
          <Link to="/portfolio" className="btn-primary inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold">
            View Full Portfolio <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= PROCESS ================= */
function Process() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="bg-grid-light pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Our Process" title="How We Bring Ideas to Life" sub="A proven 7-step framework that takes you from idea to launch — transparent at every stage." />
        <div className="relative mt-14">
          <div className="absolute left-[27px] top-4 hidden h-[calc(100%-32px)] w-px bg-gradient-to-b from-brand via-line to-transparent lg:left-1/2 lg:block" />
          <div className="space-y-5 lg:space-y-0">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={0.05}>
                <div className={cn("relative flex gap-5 lg:items-center", i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse")}>
                  <div className={cn("hidden flex-1 lg:block", i % 2 === 0 ? "lg:pr-14 lg:text-right" : "lg:pl-14")}>
                    {i % 2 === 0 ? (
                      <div className="inline-block max-w-md rounded-2xl border border-line bg-paper p-6 text-left shadow-card">
                        <StepBody s={s} />
                      </div>
                    ) : <div />}
                  </div>
                  <div className="relative z-10 flex shrink-0 flex-col items-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-card ring-4 ring-white">
                      <DynIcon name={s.icon} className="h-6 w-6" />
                    </span>
                    <span className="mt-1.5 rounded-md bg-brand-light px-2 py-0.5 font-mono text-[11px] font-bold text-brand">{s.n}</span>
                  </div>
                  <div className={cn("flex-1 lg:hidden", "")}>
                    <div className="rounded-2xl border border-line bg-paper p-5 shadow-card"><StepBody s={s} /></div>
                  </div>
                  <div className={cn("hidden flex-1 lg:block", i % 2 === 0 ? "lg:pl-14" : "lg:pr-14 lg:text-right")}>
                    {i % 2 !== 0 ? (
                      <div className="inline-block max-w-md rounded-2xl border border-line bg-paper p-6 text-left shadow-card">
                        <StepBody s={s} />
                      </div>
                    ) : <div />}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
function StepBody({ s }: { s: (typeof processSteps)[number] }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="font-display text-lg font-bold text-charcoal">{s.title}</span>
        <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] font-bold text-white">{s.n}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
    </>
  );
}

/* ================= TEAM PREVIEW ================= */
export function TeamCard({ m }: { m: (typeof team)[number] }) {
  return (
    <div className="card-lift group overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="relative h-64 overflow-hidden bg-paper">
        <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute right-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-charcoal shadow-card">{m.location}</span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-[16px] font-bold text-charcoal">{m.name}</h3>
        <p className="text-[13px] font-semibold text-brand">{m.role}</p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{m.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.skills.map((s) => <span key={s} className="rounded-md bg-paper px-2 py-1 text-[11px] font-semibold text-charcoal/70">{s}</span>)}
        </div>
      </div>
    </div>
  );
}

function TeamPreview() {
  return (
    <section className="bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Our People" title="Meet Our Team" sub="Senior engineers, designers and strategists — the people behind the pixels and code." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.slice(0, 4).map((m, i) => (
            <Reveal key={m.name} delay={(i % 4) * 0.08}><TeamCard m={m} /></Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link to="/team" className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-7 py-3.5 text-sm font-semibold text-charcoal shadow-card transition hover:border-brand hover:text-brand">
            Meet the Full Team <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= TESTIMONIALS ================= */
function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Client Love" title="What Our Clients Say" sub="Real feedback from real partnerships — 98% of clients return for phase two." />
        <Reveal delay={0.1}>
          <div
            className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-line bg-paper p-8 shadow-card sm:p-12"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <Quote className="absolute right-8 top-8 h-16 w-16 text-brand/10" />
            <div className="relative min-h-[330px] sm:min-h-[210px]">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={false}
                  animate={{ opacity: i === idx ? 1 : 0, x: i === idx ? 0 : 40 }}
                  transition={{ duration: 0.5 }}
                  className={cn("absolute inset-0", i === idx ? "pointer-events-auto" : "pointer-events-none")}
                >
                  <Stars n={t.rating} />
                  <p className="font-display mt-4 text-lg font-semibold leading-relaxed text-charcoal sm:text-xl">"{t.review}"</p>
                  <div className="mt-6 flex items-center gap-4">
                    <img src={t.image} alt={t.name} className="h-13 w-13 h-[52px] w-[52px] rounded-full border-2 border-white object-cover shadow-card" />
                    <div>
                      <p className="text-[15px] font-bold text-charcoal">{t.name}</p>
                      <p className="text-[13px] text-muted">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} aria-label={`Go to testimonial ${i + 1}`} className={cn("h-2 rounded-full transition-all", i === idx ? "w-8 bg-brand" : "w-2 bg-paper-2 hover:bg-muted-2")} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIdx((idx - 1 + testimonials.length) % testimonials.length)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-charcoal transition hover:border-brand hover:text-brand" aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => setIdx((idx + 1) % testimonials.length)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition hover:bg-brand" aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= BLOG PREVIEW ================= */
export function BlogCard({ p }: { p: (typeof blogPosts)[number] }) {
  return (
    <Link to="/blog" className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="relative h-48 overflow-hidden">
        <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-blue">{p.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[12px] font-medium text-muted">{p.date} • {p.readTime}</p>
        <h3 className="font-display mt-2 text-[17px] font-bold leading-snug text-charcoal transition group-hover:text-brand">{p.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{p.excerpt}</p>
        <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-charcoal transition group-hover:text-brand">
          Read More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function BlogPreview() {
  return (
    <section className="bg-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading align="left" eyebrow="Insights" title="Latest Insights" sub="Practical thinking on engineering, design and AI — from our team to yours." />
          <Reveal>
            <Link to="/blog" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand">
              View All Articles <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {blogPosts.slice(0, 3).map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}><BlogCard p={p} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= PAGE ================= */
export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <WhyChoose />
      <TechPreview />
      <FeaturedWork />
      <Process />
      <TeamPreview />
      <Testimonials />
      <BlogPreview />
      {/* About teaser band */}
      <section className="border-y border-line bg-white py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <img src={IMAGES.teamPair} alt="CodeCraft team collaborating" className="h-[320px] w-full rounded-2xl object-cover shadow-card sm:h-[380px]" />
              <div className="absolute -bottom-6 -right-2 rounded-2xl border border-line bg-white p-5 shadow-card sm:right-6">
                <p className="font-display text-2xl font-extrabold text-charcoal"><Counter value={5} suffix="+" /></p>
                <p className="text-[12px] font-semibold text-muted">Years of crafting software</p>
              </div>
              <span className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-ink/85 px-4 py-2.5 text-[12px] font-semibold text-white backdrop-blur">
                <Globe className="h-4 w-4 text-brand-glow" /> Serving clients in 12+ countries
              </span>
            </div>
          </Reveal>
          <div>
            <SectionHeading align="left" eyebrow="About Us" title="A software house built on craftsmanship & trust" sub="Since 2021, we've helped startups and enterprises ship reliable, beautiful software — with senior-only teams and honest communication." />
            <Reveal delay={0.15}>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {["Senior-only engineers", "Weekly demos & reports", "Fixed, honest pricing", "Post-launch support"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-charcoal">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100"><Check className="h-3.5 w-3.5 text-emerald-600" /></span>{f}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-primary mt-7 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold">
                More About Us <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
