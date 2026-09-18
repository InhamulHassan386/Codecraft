import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { techCategories } from "../data/content";
import { PageHero, Reveal, SectionHeading, DynIcon, CTASection } from "../components/layout";

export default function Technologies() {
  return (
    <>
      <PageHero
        eyebrow="Technologies"
        title="A modern stack, mastered — not just listed."
        sub="Every technology below is one we ship production software with weekly. Certified experience, real projects, measurable results."
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm text-slate-300">
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Production-proven</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Security-reviewed</span>
          <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Actively maintained</span>
        </div>
      </PageHero>

      {techCategories.map((cat, ci) => (
        <section key={cat.title} className={ci % 2 === 0 ? "bg-paper py-16 sm:py-20" : "bg-white py-16 sm:py-20"}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.5fr] lg:gap-14">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <Reveal>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white">
                    <DynIcon name={cat.icon} className="h-6 w-6" />
                  </span>
                  <p className="mt-5 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-brand">0{ci + 1} — Category</p>
                  <h2 className="font-display mt-2 text-3xl font-extrabold tracking-tight text-charcoal">{cat.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted">{cat.blurb}</p>
                  <div className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-card">
                    <p className="text-[13px] font-semibold text-charcoal">{cat.items.length} core technologies · {Math.round(cat.items.reduce((a, b) => a + b.level, 0) / cat.items.length)}% avg. mastery</p>
                  </div>
                </Reveal>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {cat.items.map((t, i) => (
                  <Reveal key={t.name} delay={(i % 2) * 0.08}>
                    <div className="card-lift h-full rounded-2xl border border-line bg-white p-6 shadow-card">
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ink to-ink-3 font-mono text-[16px] font-bold text-white">
                          {t.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="rounded-full bg-brand-light px-3 py-1 text-[12px] font-bold text-brand">{t.level}%</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-charcoal">{t.name}</h3>
                        <span className="rounded-md bg-paper px-2 py-0.5 text-[11px] font-semibold text-muted">{cat.title}</span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.description}</p>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-2">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${t.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.15 }}
                          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-glow"
                        />
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* stack banner */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink p-8 sm:p-12">
              <div className="hero-glow absolute inset-0" />
              <div className="bg-grid-dark absolute inset-0" />
              <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <SectionHeading dark align="left" eyebrow="Not sure what fits?" title="We'll recommend the right stack for your goals." sub="No hype, no lock-in. We choose technology based on your budget, timeline, team and scale — and explain the trade-offs clearly." />
                </div>
                <div className="grid w-full max-w-sm gap-3">
                  {["Free stack consultation", "Architecture review", "Migration planning"].map((t) => (
                    <div key={t} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white">
                      <Check className="h-4 w-4 text-emerald-400" />{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
