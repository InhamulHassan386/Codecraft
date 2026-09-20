import { useMemo, useState } from "react";
import { Search, ArrowRight, Clock3, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { blogCategories } from "../data/content";
import { useContent } from "../data/ContentContext";
import { PageHero, Reveal, CTASection } from "../components/layout";
import { BlogCard } from "./Home";
import { cn } from "../utils/cn";

export default function BlogPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [reading, setReading] = useState<string | null>(null);
  const { blogPosts } = useContent();

  const filtered = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchCat = cat === "All" || p.category === cat;
      const matchQ = q.trim() === "" || (p.title + p.excerpt + p.category).toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [q, cat]);

  const featured = blogPosts.filter((p) => p.featured)[0];
  const article = blogPosts.find((p) => p.slug === reading);
  const related = article ? blogPosts.filter((p) => p.slug !== article.slug && p.category === article.category).concat(blogPosts.filter((p) => p.slug !== article?.slug && p.category !== article?.category)).slice(0, 3) : [];

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights from the engineers shipping the work."
        sub="No fluff, no listicles — practical guides on web, mobile, AI, security and design from our senior team."
      >
        <div className="relative mt-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles — try 'React', 'AI', 'security'…"
            className="w-full rounded-xl border border-white/15 bg-white/8 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 backdrop-blur"
          />
        </div>
      </PageHero>

      {/* Featured */}
      {!q && cat === "All" && featured && (
        <section className="bg-white pb-4 pt-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <button onClick={() => setReading(featured.slug)} data-cursor="Read" className="group grid w-full overflow-hidden rounded-3xl border border-line bg-paper text-left shadow-card lg:grid-cols-2">
                <div className="relative h-64 overflow-hidden lg:h-full lg:min-h-[340px]">
                  <img src={featured.image} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute left-5 top-5 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">Featured · {featured.category}</span>
                </div>
                <div className="p-7 sm:p-10">
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] font-medium text-muted">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{featured.date}</span>
                    <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{featured.readTime}</span>
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-extrabold leading-tight text-charcoal transition group-hover:text-brand sm:text-3xl">{featured.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted">{featured.excerpt}</p>
                  <span className="mt-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">{featured.author.split(" ").map((w) => w[0]).join("")}</span>
                    <span><span className="block text-sm font-bold text-charcoal">{featured.author}</span><span className="block text-[12px] text-muted">{featured.authorRole}</span></span>
                  </span>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">Read Article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </button>
            </Reveal>
          </div>
        </section>
      )}

      {/* Categories + grid */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {blogCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "shrink-0 rounded-full border px-5 py-2 text-[13px] font-semibold transition",
                    cat === c ? "border-brand bg-brand text-white shadow-blue" : "border-line bg-paper text-charcoal/70 hover:border-charcoal"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
          {filtered.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-line bg-paper p-14 text-center">
              <p className="font-display text-lg font-bold text-charcoal">No articles found</p>
              <p className="mt-1 text-sm text-muted">Try a different search or category.</p>
              <button onClick={() => { setQ(""); setCat("All"); }} className="mt-5 rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white">Reset filters</button>
            </div>
          ) : (
            <motion.div layout className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <motion.div key={p.slug} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <div onClick={() => setReading(p.slug)} data-cursor="Read" className="cursor-pointer">
                    <BlogCard p={p} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Reading modal */}
      {article && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-ink/70 backdrop-blur-sm" onClick={() => setReading(null)}>
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto my-6 w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl bg-white sm:my-10"
          >
            <div className="relative h-60 sm:h-80">
              <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <button onClick={() => setReading(null)} className="absolute right-5 top-5 rounded-lg bg-white/95 px-4 py-2 text-[13px] font-bold text-charcoal">Close ✕</button>
              <div className="absolute bottom-5 left-6 right-6">
                <span className="rounded-lg bg-brand px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">{article.category}</span>
                <h2 className="font-display mt-2 text-2xl font-extrabold leading-tight text-white sm:text-3xl">{article.title}</h2>
              </div>
            </div>
            <div className="p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-5 text-[13px] text-muted">
                <span className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{article.author.split(" ").map((w) => w[0]).join("")}</span><span className="font-semibold text-charcoal">{article.author}</span></span>
                <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{article.date}</span>
                <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{article.readTime}</span>
              </div>
              <p className="mt-6 text-[17px] font-medium leading-relaxed text-charcoal">{article.excerpt}</p>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted">
                <p>At CodeCraft Solutions, we believe the best technical writing comes from production experience — not theory. This article distills what our senior team learned shipping real systems for real clients.</p>
                <h4 className="font-display pt-2 text-lg font-bold text-charcoal">Why this matters now</h4>
                <p>The landscape is shifting fast. Teams that adopt pragmatic, well-tested approaches — rather than chasing every new framework — consistently ship faster with fewer incidents. Our rule is simple: boring technology, excellent execution.</p>
                <div className="rounded-2xl border border-brand/20 bg-brand-light p-5 text-[14px] text-charcoal">
                  <span className="font-bold">Key takeaway: </span> start small, measure everything, and only scale what proves itself in production. The teams that win are the ones that iterate relentlessly on fundamentals.
                </div>
                <h4 className="font-display pt-2 text-lg font-bold text-charcoal">How we apply this with clients</h4>
                <p>Every engagement starts with a technical audit against the principles in this article. We then prioritize the highest-leverage changes first — typically delivering visible improvements within the first two sprints.</p>
                <p>Want us to apply this thinking to your product? Our team offers free 30-minute technical consultations — no pitch, just honest engineering advice.</p>
              </div>
              <div className="mt-8 border-t border-line pt-6">
                <h4 className="font-display text-[16px] font-bold text-charcoal">Related Posts</h4>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {related.map((r) => (
                    <button key={r.slug} onClick={() => setReading(r.slug)} className="group overflow-hidden rounded-xl border border-line text-left">
                      <img src={r.image} alt={r.title} className="h-28 w-full object-cover transition group-hover:scale-105" />
                      <span className="block p-3 text-[13px] font-bold leading-snug text-charcoal group-hover:text-brand">{r.title.slice(0, 60)}…</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <CTASection />
    </>
  );
}
