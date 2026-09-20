import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useContent } from "../data/ContentContext";
import { PageHero, Reveal, SectionHeading, DynIcon, CTASection, useQuote } from "../components/layout";
import { cn } from "../utils/cn";

export default function ServicesPage() {
  const { openWithService } = useQuote();
  const { services, processSteps } = useContent();
  const [expanded, setExpanded] = useState<string | null>(services[0]?.slug ?? null);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="End-to-end technology services for every stage of growth."
        sub="From first wireframe to production at scale — one senior team covering web, mobile, design, software, e-commerce, AI and cloud."
      >
        <div className="mt-8 flex flex-wrap gap-2.5">
          {services.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12.5px] font-semibold text-slate-200 backdrop-blur transition hover:border-brand hover:bg-brand hover:text-white">
              {s.title}
            </a>
          ))}
        </div>
      </PageHero>

      {/* Service detail blocks */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
          {services.map((s, i) => {
            const isOpen = expanded === s.slug;
            return (
              <Reveal key={s.slug} delay={0.03}>
                <div id={s.slug} className="scroll-mt-32 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  {/* header row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.slug)}
                    className="flex w-full items-center gap-4 p-6 text-left sm:gap-6 sm:p-8"
                  >
                    <span className={cn("hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-mono text-sm font-bold sm:flex", i % 2 === 0 ? "bg-ink text-white" : "bg-brand text-white")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition", isOpen ? "bg-brand text-white shadow-blue" : "bg-paper text-charcoal")}>
                      <DynIcon name={s.icon} className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-display block text-lg font-bold text-charcoal sm:text-xl">{s.title}</span>
                      <span className="mt-0.5 block truncate text-sm text-muted">{s.tagline} — {s.description.slice(0, 70)}…</span>
                    </span>
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition", isOpen ? "rotate-180 border-brand bg-brand-light text-brand" : "border-line text-charcoal")}>
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </button>

                  {/* expanded body */}
                  <div className={cn("grid transition-all duration-500 ease-in-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <div className="border-t border-line p-6 sm:p-8">
                        <p className="max-w-3xl text-[15px] leading-relaxed text-muted">{s.description}</p>
                        <div className="mt-7 grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
                          <div className="rounded-2xl bg-paper p-6">
                            <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-charcoal">What's Included</h4>
                            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                              {s.features.map((f) => (
                                <li key={f} className="flex items-start gap-2 text-[13.5px] font-medium text-charcoal/80">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-2xl border border-line p-6">
                            <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-charcoal">Benefits</h4>
                            <ul className="mt-4 space-y-2.5">
                              {s.benefits.map((b) => (
                                <li key={b} className="flex items-start gap-2 text-[13.5px] text-muted">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{b}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex flex-col gap-6">
                            <div className="rounded-2xl bg-ink p-6">
                              <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-white">Technologies</h4>
                              <div className="mt-4 flex flex-wrap gap-1.5">
                                {s.technologies.map((t) => (
                                  <span key={t} className="rounded-md bg-white/10 px-2.5 py-1.5 text-[12px] font-semibold text-white">{t}</span>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => openWithService(s.title)} className="btn-primary flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold">
                              Get a Quote <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
                          <span className="font-bold text-charcoal">You receive:</span>
                          {s.deliverables.map((d, di) => (
                            <span key={d} className="flex items-center gap-2">
                              <span className="font-medium">{d}</span>
                              {di < s.deliverables.length - 1 && <span className="h-1 w-1 rounded-full bg-muted-2" />}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Mini process */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="How We Deliver" title="A delivery process you can set your watch to" sub="Every service follows the same disciplined path from discovery to long-term support." />
          <div className="relative mt-12">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-line lg:block" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
              {processSteps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.06}>
                  <div className="group relative rounded-2xl border border-line bg-white p-5 text-center shadow-card transition hover:border-brand/50">
                    <span className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white transition group-hover:bg-brand group-hover:shadow-blue">
                      <DynIcon name={s.icon} className="h-6 w-6" />
                    </span>
                    <p className="mt-3 font-mono text-[11px] font-bold text-brand">{s.n}</p>
                    <p className="font-display text-[15px] font-bold text-charcoal">{s.title}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
