import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock3, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { PageHero, Reveal, LinkedinIcon, GithubIcon, FacebookIcon, InstagramIcon } from "../components/layout";
import { submitMessage } from "../data/api";

const inputCls = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-muted-2 transition";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-charcoal";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your project."
        sub="Tell us where you want to go — we'll map the fastest, safest route there. Replies within one business day, guaranteed."
      />

      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
            {/* Info column */}
            <div className="space-y-5">
              <Reveal>
                <div className="rounded-2xl bg-ink p-7 sm:p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand shadow-blue"><MessageSquare className="h-6 w-6 text-white" /></span>
                  <h3 className="font-display mt-4 text-xl font-extrabold text-white">Prefer to reach out directly?</h3>
                  <p className="mt-1.5 text-sm text-slate-400">Our team is online Mon–Fri, 9am–6pm EST.</p>
                  <div className="mt-6 space-y-4">
                    {[
                      { icon: Mail, l: "Email us", v: "hello@codecraftsolutions.com", s: "For new projects & partnerships" },
                      { icon: Phone, l: "Call us", v: "+1 (555) 012-3456", s: "Mon–Fri, 9am–6pm EST" },
                      { icon: MapPin, l: "Visit us", v: "100 Tech Avenue, Suite 400, Austin, TX", s: "Meetings by appointment" },
                    ].map((c) => (
                      <div key={c.l} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-glow"><c.icon className="h-5 w-5" /></span>
                        <span>
                          <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{c.l}</span>
                          <span className="mt-0.5 block text-[15px] font-bold text-white">{c.v}</span>
                          <span className="block text-[12px] text-slate-400">{c.s}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-2.5 border-t border-white/10 pt-6">
                    {[
                      { icon: LinkedinIcon, l: "LinkedIn" },
                      { icon: GithubIcon, l: "GitHub" },
                      { icon: FacebookIcon, l: "Facebook" },
                      { icon: InstagramIcon, l: "Instagram" },
                    ].map((s) => (
                      <a key={s.l} href="#" aria-label={s.l} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-brand hover:bg-brand hover:text-white">
                        <s.icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Clock3 className="h-6 w-6" /></span>
                  <p className="text-sm text-muted"><span className="font-bold text-charcoal">Average response time: 4 hours.</span><br />Urgent? Mention it in your message and we prioritize it.</p>
                </div>
              </Reveal>
            </div>

            {/* Form column */}
            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-9">
                {!sent ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
                    setSending(true);
                    setSendError("");
                    try {
                      await submitMessage(fd);
                      setSent(true);
                    } catch (err) {
                      setSendError(err instanceof Error ? err.message : "Could not send — please try again.");
                    } finally {
                      setSending(false);
                    }
                  }}>
                    <h3 className="font-display text-2xl font-extrabold text-charcoal">Send us a message</h3>
                    <p className="mt-1.5 text-sm text-muted">Fields marked * are required. We never share your details.</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div><label className={labelCls}>Full Name *</label><input required name="name" placeholder="John Smith" className={inputCls} /></div>
                      <div><label className={labelCls}>Email *</label><input required type="email" name="email" placeholder="john@company.com" className={inputCls} /></div>
                      <div><label className={labelCls}>Phone</label><input name="phone" placeholder="+1 (555) 000-0000" className={inputCls} /></div>
                      <div><label className={labelCls}>Company</label><input name="company" placeholder="Company Inc." className={inputCls} /></div>
                      <div>
                        <label className={labelCls}>Service Needed *</label>
                        <select required name="service" defaultValue="" className={inputCls}>
                          <option value="" disabled>Select a service</option>
                          {["Web Development", "Mobile App Development", "UI/UX Design", "Software Development", "E-Commerce Development", "AI & Automation", "Cloud Solutions", "Maintenance & Support", "Not sure yet"].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Budget</label>
                        <select name="budget" defaultValue="" className={inputCls}>
                          <option value="" disabled>Select budget</option>
                          <option>Under $5,000</option><option>$5,000 – $10,000</option><option>$10,000 – $25,000</option><option>$25,000 – $50,000</option><option>$50,000+</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2"><label className={labelCls}>Message *</label><textarea required rows={5} name="message" placeholder="Tell us about your goals, timeline, and what success looks like…" className={`${inputCls} resize-none`} /></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {sendError && <p className="text-[12px] font-semibold text-red-500">{sendError}</p>}
                      <button type="submit" disabled={sending} className="btn-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold disabled:opacity-60 sm:w-auto sm:px-12">
                        {sending ? "Sending…" : "Send Message"} <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="py-12 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </motion.div>
                    <h3 className="font-display mt-5 text-2xl font-extrabold text-charcoal">Message sent successfully!</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">Thanks for reaching out. A member of our team will reply within one business day — usually much faster.</p>
                    <button onClick={() => setSent(false)} className="mt-6 rounded-xl border border-line px-8 py-3 text-sm font-semibold text-charcoal transition hover:border-brand hover:text-brand">Send another message</button>
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* Map */}
          <Reveal delay={0.1}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="flex flex-col items-start justify-between gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:px-7">
                <div>
                  <h3 className="font-display text-lg font-bold text-charcoal">Find us in Austin, TX</h3>
                  <p className="text-sm text-muted">100 Tech Avenue, Suite 400, Austin, TX 78701 — plus remote teams worldwide.</p>
                </div>
                <a href="https://maps.google.com/?q=Austin,TX" target="_blank" rel="noreferrer" className="rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand">Get Directions</a>
              </div>
              <iframe
                title="CodeCraft Solutions office map"
                src="https://www.google.com/maps?q=Austin,TX&output=embed"
                className="h-[320px] w-full border-0 sm:h-[380px]"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
