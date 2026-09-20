import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Clock3, Briefcase, Sparkles, CheckCircle2, X, Send, ChevronDown, Coffee, GraduationCap, HeartPulse, Globe2 } from "lucide-react";
import { IMAGES } from "../data/content";
import { useContent } from "../data/ContentContext";
import { PageHero, Reveal, SectionHeading, CTASection } from "../components/layout";
import { cn } from "../utils/cn";

const perks = [
  { icon: Globe2, title: "Remote-First", text: "Work from anywhere with async-friendly hours and quality equipment budget." },
  { icon: GraduationCap, title: "Learning Budget", text: "$1,500/year for courses, books and conferences. Growth is part of the job." },
  { icon: HeartPulse, title: "Health & Wellness", text: "Comprehensive health coverage plus wellness stipend and mental-health days." },
  { icon: Coffee, title: "Real Balance", text: "20+ PTO days, no crunch culture, and Fridays that actually end on time." },
];

export default function Careers() {
  const [dept, setDept] = useState("All");
  const { jobs } = useContent();
  const [expanded, setExpanded] = useState<string | number | null>(jobs[0]?.id ?? null);
  const [applyJob, setApplyJob] = useState<string | number | null>(null);
  const [applied, setApplied] = useState(false);

  const depts = ["All", ...Array.from(new Set(jobs.map((j) => j.department)))];
  const list = dept === "All" ? jobs : jobs.filter((j) => j.department === dept);
  const job = jobs.find((j) => j.id === applyJob);

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Do the best work of your career, with people who care."
        sub="Join a senior-only team shipping products used by hundreds of thousands. Remote-first, growth-obsessed, zero politics."
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href="#openings" className="btn-primary flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold">
            View Open Positions <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-sm text-slate-300"><span className="font-bold text-white">{jobs.length} open roles</span> · hiring across time zones</p>
        </div>
      </PageHero>

      {/* life band */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <img src={IMAGES.teamBreak} alt="Life at CodeCraft" className="h-[300px] w-full rounded-2xl object-cover shadow-card sm:h-[360px]" />
            </Reveal>
            <div>
              <SectionHeading align="left" eyebrow="Life at CodeCraft" title="Why engineers stay here" sub="We optimize for craft, autonomy and momentum — the things great people actually want." />
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {perks.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.07}>
                    <div className="h-full rounded-2xl border border-line bg-paper p-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white"><p.icon className="h-5 w-5" /></span>
                      <h4 className="font-display mt-3 text-[15px] font-bold text-charcoal">{p.title}</h4>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{p.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* openings */}
      <section id="openings" className="scroll-mt-28 bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading eyebrow="Open Positions" title="Find your role" sub="Can't see your fit? Send your portfolio to careers@codecraftsolutions.com — we always read them." />
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {depts.map((d) => (
                <button key={d} onClick={() => setDept(d)} className={cn("rounded-full border px-5 py-2 text-[13px] font-semibold transition", dept === d ? "border-ink bg-ink text-white" : "border-line bg-white text-charcoal/70 hover:border-charcoal")}>
                  {d}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="mt-8 space-y-4">
            {list.map((j) => {
              const isOpen = expanded === j.id;
              return (
                <Reveal key={j.id}>
                  <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                    <button onClick={() => setExpanded(isOpen ? null : j.id)} className="flex w-full items-center gap-4 p-5 text-left sm:p-6">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand"><Briefcase className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="font-display block text-[16px] font-bold text-charcoal sm:text-lg">{j.title}</span>
                        <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] font-medium text-muted">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{j.location}</span>
                          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{j.type} · {j.experience}</span>
                          <span className="hidden sm:inline">Posted {j.posted}</span>
                        </span>
                      </span>
                      <span className={cn("hidden rounded-full px-3 py-1.5 text-[11px] font-bold sm:block", j.type === "Internship" ? "bg-amber-100 text-amber-700" : j.type === "Contract" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700")}>{j.type}</span>
                      <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted transition", isOpen && "rotate-180 text-brand")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                          <div className="border-t border-line p-5 sm:p-6">
                            <p className="text-sm leading-relaxed text-muted">{j.description}</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                              <div>
                                <h5 className="text-[12px] font-bold uppercase tracking-[0.12em] text-charcoal">Responsibilities</h5>
                                <ul className="mt-2.5 space-y-2">
                                  {j.responsibilities.map((r) => (
                                    <li key={r} className="flex items-start gap-2 text-[13.5px] text-muted"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />{r}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-[12px] font-bold uppercase tracking-[0.12em] text-charcoal">Required Skills</h5>
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  {j.skills.map((s) => (
                                    <span key={s} className="rounded-md bg-ink px-2.5 py-1.5 text-[12px] font-semibold text-white">{s}</span>
                                  ))}
                                </div>
                                <p className="mt-4 rounded-xl bg-paper p-3.5 text-[12.5px] leading-relaxed text-muted"><span className="font-bold text-charcoal">{j.department}</span> · {j.experience} experience · Posted {j.posted}</p>
                              </div>
                            </div>
                            <button onClick={() => { setApplyJob(j.id); setApplied(false); }} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold sm:w-auto sm:px-8">
                              Apply Now <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apply modal */}
      <AnimatePresence>
        {applyJob && job && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setApplyJob(null)}>
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl sm:p-8"
            >
              {!applied ? (
                <form onSubmit={(e) => { e.preventDefault(); setApplied(true); }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="section-eyebrow">Apply</span>
                      <h3 className="font-display mt-1.5 text-xl font-extrabold text-charcoal">{job.title}</h3>
                      <p className="mt-1 text-[13px] text-muted">{job.location} · {job.type}</p>
                    </div>
                    <button type="button" onClick={() => setApplyJob(null)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div><label className="mb-1.5 block text-[13px] font-semibold">Full Name *</label><input required placeholder="Jane Doe" className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm" /></div>
                    <div><label className="mb-1.5 block text-[13px] font-semibold">Email *</label><input required type="email" placeholder="jane@email.com" className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm" /></div>
                    <div><label className="mb-1.5 block text-[13px] font-semibold">Phone</label><input placeholder="+1 ..." className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm" /></div>
                    <div><label className="mb-1.5 block text-[13px] font-semibold">Portfolio / LinkedIn</label><input placeholder="https://" className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm" /></div>
                    <div className="sm:col-span-2"><label className="mb-1.5 block text-[13px] font-semibold">Why are you a great fit? *</label><textarea required rows={4} placeholder="Tell us about your experience, proudest project, and why CodeCraft..." className="w-full resize-none rounded-lg border border-line px-3.5 py-2.5 text-sm" /></div>
                    <div className="sm:col-span-2">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper px-4 py-4 text-sm font-medium text-muted hover:border-brand hover:text-brand">
                        Upload Resume (PDF) *
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold">
                    Submit Application <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </motion.div>
                  <h3 className="font-display mt-4 text-2xl font-extrabold">Application sent!</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Thanks for applying for <span className="font-semibold text-charcoal">{job.title}</span>. Our hiring team reviews every application and replies within 5 working days.</p>
                  <button onClick={() => setApplyJob(null)} className="mt-6 rounded-xl bg-ink px-8 py-3 text-sm font-semibold text-white">Close</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CTASection />
    </>
  );
}
