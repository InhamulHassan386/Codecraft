import { Link } from "react-router-dom";
import { ArrowRight, Target, Eye, Heart, Award, Users, Zap, Check, Quote } from "lucide-react";
import { IMAGES } from "../data/content";
import { useContent } from "../data/ContentContext";
import { PageHero, Reveal, SectionHeading, Counter, CTASection, useQuote, Stars, DynIcon } from "../components/layout";

const values = [
  { icon: Award, title: "Craftsmanship", text: "We write code like it has our name on it — because it does. Clean, tested, documented." },
  { icon: Heart, title: "Honesty", text: "Realistic estimates, transparent progress, bad news early. No surprises, ever." },
  { icon: Users, title: "Partnership", text: "Your goals become our goals. We challenge ideas and celebrate your wins like our own." },
  { icon: Zap, title: "Velocity", text: "Senior teams, tight feedback loops and weekly demos. Momentum you can feel." },
];

const journey = [
  { year: "2021", title: "Founded in Lahore", text: "Three engineers, one laptop-filled apartment, and a belief that great software is crafted — not churned." },
  { year: "2022", title: "First 15 clients", text: "Word of mouth carried us. We shipped web platforms across 4 countries and grew to 8 people." },
  { year: "2023", title: "Mobile & AI practice", text: "Launched our Flutter and AI automation practices. First 100k-user app goes live." },
  { year: "2024", title: "30+ clients, global team", text: "Remote-first across 6 countries. Enterprise contracts, design systems practice, 99.9% uptime SLA." },
  { year: "2025", title: "50+ projects shipped", text: "Fintech, healthtech, logistics and retail. A senior-only team of 15+ craftspeople." },
  { year: "2026", title: "What's next", text: "Deeper AI integrations, dedicated product squads, and the same obsession: software that works beautifully." },
];

export default function About() {
  const { open } = useQuote();
  const { whyChooseUs, team } = useContent();
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="We're CodeCraft Solutions — engineers who care about outcomes."
        sub="A full-cycle software house helping startups and enterprises design, build and scale digital products since 2021."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={open} className="btn-primary flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold">
            Work With Us <ArrowRight className="h-4 w-4" />
          </button>
          <Link to="/team" className="btn-ghost-dark rounded-xl px-7 py-3.5 text-sm font-semibold">Meet the Team</Link>
        </div>
      </PageHero>

      {/* Intro story */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Our Story" title="From three engineers to a global software house" />
            <Reveal delay={0.15}>
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
                <p>
                  <span className="font-semibold text-charcoal">CodeCraft Solutions</span> started in 2021 with a simple frustration: too much software ships broken, late, or bloated. We believed businesses deserved better — senior engineers who communicate clearly, design with intent, and treat every codebase like a long-term asset.
                </p>
                <p>
                  Five years later, that philosophy powers <span className="font-semibold text-charcoal">50+ shipped projects</span> across fintech, healthcare, logistics, retail and education — serving clients in 12+ countries with a remote-first team of 15+ specialists.
                </p>
                <p>
                  We stay deliberately senior-only. No juniors learning on your budget. Every project gets architects who've done it before, designers who think in systems, and QA engineers who break things before your users do.
                </p>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-4">
                {[
                  { v: 50, s: "+", l: "Projects" },
                  { v: 30, s: "+", l: "Clients" },
                  { v: 12, s: "+", l: "Countries" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-line bg-paper p-4 text-center">
                    <p className="font-display text-2xl font-extrabold text-charcoal sm:text-3xl"><Counter value={s.v} suffix={s.s} /></p>
                    <p className="mt-1 text-[12px] font-semibold text-muted">{s.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="relative">
              <img src={IMAGES.teamOffice} alt="CodeCraft office" className="h-[420px] w-full rounded-2xl object-cover shadow-card" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-ink/85 p-5 backdrop-blur sm:right-auto sm:max-w-sm">
                <Quote className="h-6 w-6 text-brand-glow" />
                <p className="mt-2 text-sm font-medium leading-relaxed text-white">"We treat your product like our own company depends on it — because our reputation does."</p>
                <p className="mt-3 text-[12px] font-semibold text-slate-400">— Muhammad Ali, Founder & Lead Engineer</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="relative h-full overflow-hidden rounded-2xl bg-ink p-8 sm:p-10">
                <div className="hero-glow absolute inset-0" />
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand shadow-blue"><Target className="h-6 w-6 text-white" /></span>
                  <h3 className="font-display mt-5 text-2xl font-extrabold text-white">Our Mission</h3>
                  <p className="mt-3 leading-relaxed text-slate-300">
                    To give every ambitious business access to world-class software craftsmanship — reliable engineering, honest communication and products that create measurable growth.
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {["Ship software that works, first time", "Make enterprise quality accessible", "Build partnerships measured in years"].map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-sm text-slate-200"><Check className="h-4 w-4 text-emerald-400" />{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl border border-line bg-white p-8 shadow-card sm:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand"><Eye className="h-6 w-6" /></span>
                <h3 className="font-display mt-5 text-2xl font-extrabold text-charcoal">Our Vision</h3>
                <p className="mt-3 leading-relaxed text-muted">
                  To be the software partner companies recommend without hesitation — known globally for quality, integrity and products that stand the test of scale.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-paper p-4"><p className="font-display text-xl font-extrabold text-brand">2030</p><p className="text-[12px] font-medium text-muted">100+ products in production</p></div>
                  <div className="rounded-xl bg-paper p-4"><p className="font-display text-xl font-extrabold text-brand">Global</p><p className="text-[12px] font-medium text-muted">Teams across 4 continents</p></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Core Values" title="What we stand for" sub="Four principles guide every estimate, every sprint and every line of code." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="card-lift h-full rounded-2xl border border-line bg-white p-7 text-center shadow-card">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white"><v.icon className="h-6 w-6" /></span>
                  <h3 className="font-display mt-5 text-lg font-bold text-charcoal">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="relative overflow-hidden bg-ink py-20 sm:py-24">
        <div className="hero-glow absolute inset-0" />
        <div className="bg-grid-dark absolute inset-0" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <SectionHeading dark eyebrow="Company Journey" title="Five years of shipping" sub="How a three-person team became a trusted software house." />
          <div className="relative mt-14">
            <div className="absolute bottom-4 left-[19px] top-4 w-px bg-white/12 sm:left-1/2" />
            <div className="space-y-8">
              {journey.map((j, i) => (
                <Reveal key={j.year} delay={0.05}>
                  <div className={`relative flex gap-6 sm:items-center ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                    <div className="relative z-10 flex shrink-0 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-ink font-mono text-[11px] font-bold text-white">{j.year.slice(2)}</span>
                    </div>
                    <div className={`flex-1 sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                      <div className={`rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-left backdrop-blur ${i % 2 === 0 ? "sm:ml-auto sm:max-w-md" : "sm:max-w-md"}`}>
                        <p className="font-mono text-[12px] font-bold text-[#7aa5ff]">{j.year}</p>
                        <h4 className="font-display mt-1 text-[17px] font-bold text-white">{j.title}</h4>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{j.text}</p>
                      </div>
                    </div>
                    <div className="hidden flex-1 sm:block" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why clients choose us strip */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Trust" title="Why clients choose us" sub="The same reasons they stay — and refer their peers." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((w, i) => (
              <Reveal key={w.title} delay={(i % 3) * 0.07}>
                <div className="flex h-full gap-4 rounded-2xl border border-line bg-white p-6 shadow-card">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand"><DynIcon name={w.icon} className="h-5 w-5" /></span>
                  <div>
                    <h4 className="font-display text-[15px] font-bold text-charcoal">{w.title}</h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{w.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          {/* team teaser */}
          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl bg-ink p-8 sm:flex-row sm:p-10">
              <div className="flex items-center gap-5">
                <div className="flex -space-x-3">
                  {team.slice(0, 5).map((m) => (
                    <img key={m.name} src={m.image} alt={m.name} className="h-12 w-12 rounded-full border-[3px] border-ink object-cover" />
                  ))}
                </div>
                <div>
                  <Stars n={5} />
                  <p className="mt-1 text-sm text-slate-300"><span className="font-bold text-white">15+ specialists</span> across engineering, design & delivery</p>
                </div>
              </div>
              <Link to="/team" className="btn-primary flex shrink-0 items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold">
                Meet Our Team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
