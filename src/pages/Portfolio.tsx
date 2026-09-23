import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Calendar, User, Clock3 } from "lucide-react";
import { projects as seedProjects, type Project } from "../data/content";
import { getResource } from "../data/blogApi";
import { PageHero, Reveal, Counter, CTASection, useQuote } from "../components/layout";
import { cn } from "../utils/cn";

const filters = ["All", "Web", "Mobile", "UI/UX", "Software", "E-Commerce"];

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const { open } = useQuote();
  useEffect(() => { getResource<Project>("projects", seedProjects).then((items) => { if (items.length) setProjects(items); }); }, []);
  const list = filter === "All" ? projects : projects.filter((p) => p.category === filter);
  const active = projects.find((p) => p.slug === activeSlug);

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Work that ships, scales and sells."
        sub="Every project below is in production today. Real clients, real users, real results — with senior teams from kickoff to launch."
      >
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
          {[
            { v: 50, s: "+", l: "Projects shipped" },
            { v: 98, s: "%", l: "Client satisfaction" },
            { v: 12, s: "+", l: "Industries served" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="font-display text-2xl font-extrabold text-white"><Counter value={s.v} suffix={s.s} /></p>
              <p className="mt-0.5 text-[11.5px] font-medium text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-[13px] font-semibold transition",
                      filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-charcoal/70 hover:border-charcoal"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-muted">Showing <span className="font-bold text-charcoal">{list.length}</span> projects</p>
            </div>
          </Reveal>

          <motion.div layout className="mt-8 grid gap-6 lg:grid-cols-2">
            {list.map((p) => (
              <motion.article
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-1.5 hover:shadow-card-hover"
              >
                <div className="relative h-64 overflow-hidden sm:h-72">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-charcoal">{p.category}</span>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                    <h3 className="font-display text-xl font-extrabold leading-tight text-white sm:text-2xl">{p.name}</h3>
                  </div>
                </div>
                <div className="p-6 sm:p-7">
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] font-medium text-muted">
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{p.client}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{p.year}</span>
                    <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{p.duration}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.longDescription.slice(0, 160)}…</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.technologies.map((t) => (
                      <span key={t} className="rounded-md bg-paper px-2.5 py-1 text-[11.5px] font-semibold text-charcoal/70">{t}</span>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-paper p-4">
                    {p.results.map((r) => (
                      <div key={r.label} className="text-center">
                        <p className="font-display text-lg font-extrabold text-brand sm:text-xl">{r.value}</p>
                        <p className="mt-0.5 text-[11px] font-medium leading-tight text-muted">{r.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button onClick={() => setActiveSlug(p.slug)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand">
                      View Case Study <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <button onClick={open} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-charcoal transition hover:border-brand hover:text-brand">
                      Start Similar <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Case study modal */}
      {active && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setActiveSlug(null)}>
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl"
          >
            <div className="relative h-60 sm:h-72">
              <img src={active.image} alt={active.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <button onClick={() => setActiveSlug(null)} className="absolute right-5 top-5 rounded-lg bg-white/95 px-4 py-2 text-[13px] font-bold text-charcoal">Close ✕</button>
              <div className="absolute bottom-5 left-6 right-6">
                <span className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">{active.category}</span>
                <h3 className="font-display mt-2 text-2xl font-extrabold text-white sm:text-3xl">{active.name}</h3>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Client", v: active.client },
                  { l: "Timeline", v: active.duration },
                  { l: "Year", v: active.year },
                ].map((m) => (
                  <div key={m.l} className="rounded-xl bg-paper p-3.5 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{m.l}</p>
                    <p className="mt-1 text-sm font-bold text-charcoal">{m.v}</p>
                  </div>
                ))}
              </div>
              <h4 className="font-display mt-6 text-lg font-bold text-charcoal">Challenge & Solution</h4>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{active.longDescription}</p>
              <h4 className="font-display mt-6 text-lg font-bold text-charcoal">Measured Results</h4>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {active.results.map((r) => (
                  <div key={r.label} className="rounded-xl border border-brand/20 bg-brand-light p-4 text-center">
                    <p className="font-display text-xl font-extrabold text-brand sm:text-2xl">{r.value}</p>
                    <p className="mt-1 text-[11.5px] font-medium text-charcoal/70">{r.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {active.technologies.map((t) => (
                  <span key={t} className="rounded-md bg-ink px-3 py-1.5 text-[12px] font-semibold text-white">{t}</span>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => { setActiveSlug(null); open(); }} className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold">
                  Build Something Like This <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <CTASection />
    </>
  );
}
