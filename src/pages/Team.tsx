import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { team } from "../data/content";
import { PageHero, Reveal, SectionHeading, CTASection, LinkedinIcon, GithubIcon } from "../components/layout";

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="Senior people. No passengers."
        sub="A deliberately senior-only team of engineers, designers and delivery leads — 15+ specialists across 6 countries, united by craft."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <div className="flex -space-x-3">
            {team.slice(0, 6).map((m) => (
              <img key={m.name} src={m.image} alt={m.name} className="h-11 w-11 rounded-full border-[3px] border-ink object-cover" />
            ))}
          </div>
          <p className="flex items-center text-sm text-slate-300"><span className="font-bold text-white">5+ yrs</span>&nbsp;average experience · <span className="font-bold text-white">&nbsp;50+&nbsp;</span> projects shipped</p>
        </div>
      </PageHero>

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading eyebrow="Leadership & Engineers" title="Meet the people behind the work" sub="Every project gets direct access to the people below — no account-manager telephone game." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={(i % 4) * 0.07}>
                <div className="card-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  <div className="relative h-72 overflow-hidden">
                    <img src={m.image} alt={m.name} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-charcoal">
                      <MapPin className="h-3 w-3 text-brand" />{m.location}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-[17px] font-bold leading-tight text-white">{m.name}</h3>
                        <p className="text-[12.5px] font-semibold text-brand-glow">{m.role}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <a href="#" aria-label={`${m.name} LinkedIn`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition hover:bg-brand"><LinkedinIcon className="h-4 w-4" /></a>
                        <a href="#" aria-label={`${m.name} GitHub`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition hover:bg-brand"><GithubIcon className="h-4 w-4" /></a>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[13.5px] leading-relaxed text-muted">{m.bio}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5 border-t border-line pt-4">
                      {m.skills.map((s) => (
                        <span key={s} className="rounded-md bg-paper px-2.5 py-1 text-[11.5px] font-semibold text-charcoal/70">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* culture band */}
          <Reveal delay={0.1}>
            <div className="mt-14 grid gap-6 rounded-3xl bg-ink p-8 sm:p-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <span className="section-eyebrow on-dark">Our Culture</span>
                <h3 className="font-display mt-3 text-2xl font-extrabold text-white sm:text-3xl">Built for people who take pride in their work</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">Remote-first, async-friendly and allergic to micromanagement. We hire adults, give them hard problems, and get out of the way.</p>
                <Link to="/careers" className="btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                  Join the Team <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: "Remote-first", l: "Work from anywhere" },
                  { v: "4.9/5", l: "Team satisfaction" },
                  { v: "20+", l: "Learning days / year" },
                  { v: "0", l: "Micromanagers" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="font-display text-xl font-extrabold text-white sm:text-2xl">{s.v}</p>
                    <p className="mt-1 text-[12px] text-slate-400">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
