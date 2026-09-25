import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, Briefcase, Users, MessageSquare, FileText, PenLine,
  Quote as QuoteIcon, Settings, Search, Bell, ChevronDown, Plus, Eye, Pencil, Trash2,
  TrendingUp, ArrowUpRight, CheckCircle2, Clock3, XCircle, Menu, X, LogOut, Filter,
} from "lucide-react";
import { projects, team, blogPosts, jobs, testimonials } from "../data/content";
import { Counter } from "../components/layout";
import { cn } from "../utils/cn";

type Tab = "dashboard" | "projects" | "services" | "team" | "testimonials" | "blog" | "careers" | "messages" | "quotes" | "settings";

const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban, badge: projects.length },
  { id: "services", label: "Services", icon: Briefcase, badge: 8 },
  { id: "team", label: "Team", icon: Users, badge: team.length },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare, badge: testimonials.length },
  { id: "blog", label: "Blog", icon: PenLine, badge: blogPosts.length },
  { id: "careers", label: "Careers", icon: FileText, badge: jobs.length },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: 12 },
  { id: "quotes", label: "Quote Requests", icon: QuoteIcon, badge: 7 },
  { id: "settings", label: "Settings", icon: Settings },
];

const mockMessages = [
  { name: "Robert Hayes", email: "robert@techcorp.com", subject: "E-commerce rebuild inquiry", date: "Sep 14, 2026", status: "New", service: "E-Commerce" },
  { name: "Lisa Wong", email: "lisa@startup.io", subject: "MVP development — fintech", date: "Sep 13, 2026", status: "Replied", service: "Web Development" },
  { name: "Omar Farouk", email: "omar@retail.com", subject: "Mobile app for inventory", date: "Sep 12, 2026", status: "New", service: "Mobile Apps" },
  { name: "Anna Petrova", email: "anna@healthplus.eu", subject: "Patient portal redesign", date: "Sep 11, 2026", status: "In Progress", service: "UI/UX Design" },
  { name: "Carlos Mendez", email: "carlos@logistics.co", subject: "ERP integration support", date: "Sep 10, 2026", status: "Replied", service: "Software" },
];

const mockQuotes = [
  { name: "TechCorp Ltd.", contact: "Robert Hayes", service: "E-Commerce Development", budget: "$25k – $50k", date: "Sep 14, 2026", status: "Pending" },
  { name: "Startup.io", contact: "Lisa Wong", service: "Web Development", budget: "$10k – $25k", date: "Sep 13, 2026", status: "Quoted" },
  { name: "RetailMax", contact: "Omar Farouk", service: "Mobile App Development", budget: "$25k – $50k", date: "Sep 12, 2026", status: "Pending" },
  { name: "HealthPlus", contact: "Anna Petrova", service: "UI/UX Design", budget: "$5k – $10k", date: "Sep 11, 2026", status: "Accepted" },
  { name: "LogiCo", contact: "Carlos Mendez", service: "Software Development", budget: "$50k+", date: "Sep 10, 2026", status: "Quoted" },
];

const mockApps = [
  { name: "Jane Cooper", role: "Senior React Developer", date: "Sep 13, 2026", status: "Interview", exp: "5 yrs" },
  { name: "Tom Baker", role: "Flutter Developer", date: "Sep 12, 2026", status: "New", exp: "3 yrs" },
  { name: "Sara Ahmed", role: "UI/UX Designer", date: "Sep 11, 2026", status: "Shortlisted", exp: "4 yrs" },
  { name: "Mike Ross", role: "Web Dev Intern", date: "Sep 10, 2026", status: "New", exp: "0 yrs" },
];

const revenue = [42, 58, 45, 70, 62, 84, 76, 92, 88, 104, 98, 120];

function StatusPill({ s }: { s: string }) {
  const map: Record<string, string> = {
    New: "bg-brand-light text-brand",
    Pending: "bg-amber-100 text-amber-700",
    Replied: "bg-emerald-100 text-emerald-700",
    Quoted: "bg-violet-100 text-violet-700",
    Accepted: "bg-emerald-100 text-emerald-700",
    "In Progress": "bg-sky-100 text-sky-700",
    Interview: "bg-violet-100 text-violet-700",
    Shortlisted: "bg-amber-100 text-amber-700",
    Live: "bg-emerald-100 text-emerald-700",
    Draft: "bg-slate-100 text-slate-600",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", map[s] || "bg-slate-100 text-slate-600")}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>;
}

function RowActions({ onEdit, onDelete, onView }: { onEdit?: () => void; onDelete?: () => void; onView?: () => void }) {
  return (
    <div className="flex justify-end gap-1.5">
      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand hover:text-brand" onClick={onView} title="View"><Eye className="h-4 w-4" /></button>
      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand hover:text-brand" onClick={onEdit} title="Edit"><Pencil className="h-4 w-4" /></button>
      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-red-400 hover:text-red-500" onClick={onDelete} title="Delete"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebar, setSidebar] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [projectRows, setProjectRows] = useState<any[]>(projects);
  const [projectModal, setProjectModal] = useState<{ mode: "add" | "edit"; item?: any } | null>(null);
  const [projectMessage, setProjectMessage] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  useEffect(() => {
    fetch("/api/projects").then((response) => response.ok ? response.json() : Promise.reject()).then((rows) => {
      if (Array.isArray(rows) && rows.length > 0) setProjectRows(rows);
    }).catch(() => setProjectMessage("Projects load nahi huay. Backend aur MySQL start karein."));
  }, []);

  const saveProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget).entries());
    const data = { ...raw, name: raw.name || raw.title, description: raw.description || "", long_description: raw.long_description || raw.description || "", technologies: JSON.stringify(String(raw.technologies || "").split(",").map((v) => v.trim()).filter(Boolean)), results: JSON.stringify(String(raw.results || "").split(",").map((v) => v.trim()).filter(Boolean)), duration: raw.duration || "Not specified", published: 1 };
    delete (data as any).title;
    try {
      const editing = projectModal?.mode === "edit";
      const response = await fetch(editing && projectModal?.item?.id ? `/api/projects/${projectModal.item.id}` : "/api/projects", {
        method: editing && projectModal?.item?.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("API unavailable");
      const saved = await response.json();
      setProjectRows((rows) => editing && projectModal?.item?.id ? rows.map((row) => row.id === saved.id ? saved : row) : [saved, ...rows]);
      setProjectModal(null); setProjectMessage("");
    } catch { setProjectMessage("Backend/database connect nahi hai. MySQL aur API start karein."); }
  };
  const deleteProject = async (item: any) => {
    if (!window.confirm(`Delete ${item.name || item.title}?`)) return;
    try {
      const response = await fetch(`/api/projects/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setProjectRows((rows) => rows.filter((row) => row.id !== item.id));
    } catch { setProjectMessage("Project delete nahi hua. API/database check karein."); }
  };

  const stats = useMemo(() => [
    { label: "Total Projects", value: 52, icon: FolderKanban, delta: "+4 this month", color: "bg-brand" },
    { label: "Total Messages", value: 148, icon: MessageSquare, delta: "+12 unread", color: "bg-violet-500" },
    { label: "Applications", value: 86, icon: FileText, delta: "+9 this week", color: "bg-amber-500" },
    { label: "Blog Posts", value: blogPosts.length, icon: PenLine, delta: "2 drafts", color: "bg-emerald-500" },
    { label: "Quote Requests", value: 34, icon: QuoteIcon, delta: "7 pending", color: "bg-rose-500" },
  ], []);

  if (!authed) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-paper px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-card sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink"><LayoutDashboard className="h-6 w-6 text-white" /></span>
          <h1 className="font-display mt-5 text-center text-2xl font-extrabold text-charcoal">Admin Panel</h1>
          <p className="mt-1.5 text-center text-sm text-muted">Sign in to manage content, projects & inquiries. <span className="font-semibold">(Demo — any credentials work)</span></p>
          <form className="mt-7 space-y-4" onSubmit={(e) => { e.preventDefault(); setAuthed(true); }}>
            <div><label className="mb-1.5 block text-[13px] font-semibold">Email</label><input type="email" required defaultValue="admin@codecraftsolutions.com" className="w-full rounded-xl border border-line px-4 py-3 text-sm" /></div>
            <div><label className="mb-1.5 block text-[13px] font-semibold">Password</label><input type="password" required defaultValue="password" className="w-full rounded-xl border border-line px-4 py-3 text-sm" /></div>
            <button type="submit" className="btn-primary w-full rounded-xl px-6 py-3.5 text-sm font-semibold">Sign In to Dashboard</button>
          </form>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-muted"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Secured with 2FA & audit logs in production</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* topbar */}
      <div className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setSidebar(!sidebar)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line lg:hidden" aria-label="Menu">
            {sidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white font-mono text-[13px] font-bold">CC</span>
            <span className="hidden sm:block"><span className="font-display block text-[14px] font-extrabold leading-none">CodeCraft Admin</span><span className="mt-0.5 block text-[11px] text-muted">Content Management System</span></span>
          </div>
          <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <input placeholder="Search projects, messages…" className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-[13px]" />
          </div>
          <button className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-line md:ml-0" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5 h-5 w-5 text-charcoal" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-line py-1.5 pl-1.5 pr-3">
            <img src={team[0].image} alt="Admin" className="h-7 w-7 rounded-lg object-cover" />
            <span className="hidden text-left sm:block"><span className="block text-[12.5px] font-bold leading-none">Admin</span><span className="mt-0.5 block text-[10.5px] text-muted">Super Admin</span></span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
          <Link to="/" className="hidden h-10 items-center gap-1.5 rounded-xl border border-line px-4 text-[13px] font-semibold text-charcoal transition hover:border-brand hover:text-brand sm:flex">
            ← Website
          </Link>
          <button onClick={() => setAuthed(false)} className="hidden h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-red-600 sm:flex">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-0 px-0 sm:px-6 sm:py-6 lg:gap-6">
        {/* sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-line bg-white p-4 transition-transform lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:rounded-2xl lg:border",
          sidebar && "translate-x-0"
        )}>
          <div className="flex items-center justify-between lg:hidden">
            <span className="font-display text-[15px] font-extrabold">Menu</span>
            <button onClick={() => setSidebar(false)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper"><X className="h-4 w-4" /></button>
          </div>
          <nav className="mt-2 space-y-1 lg:mt-0">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebar(false); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition",
                  tab === t.id ? "bg-ink text-white shadow-card" : "text-charcoal/70 hover:bg-paper"
                )}
              >
                <t.icon className="h-[18px] w-[18px]" />
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge != null && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-bold", tab === t.id ? "bg-white/15 text-white" : "bg-paper-2 text-charcoal")}>{t.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-2xl bg-ink p-4">
            <p className="text-[13px] font-bold text-white">Need help?</p>
            <p className="mt-1 text-[12px] text-slate-400">Docs & video guides for every module.</p>
            <button className="mt-3 w-full rounded-lg bg-brand py-2 text-[12.5px] font-bold text-white">View Docs</button>
          </div>
        </aside>
        {sidebar && <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={() => setSidebar(false)} />}

        {/* main */}
        <main className="min-w-0 flex-1 p-4 sm:p-0 lg:p-1">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              {tab === "dashboard" && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h1 className="font-display text-2xl font-extrabold text-charcoal">Good morning, Admin 👋</h1>
                      <p className="text-sm text-muted">Here's what's happening across your website today.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-semibold"><Filter className="h-4 w-4" /> Last 30 days</button>
                      <button onClick={() => { setTab("projects"); setProjectModal({ mode: "add" }); }} className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold"><Plus className="h-4 w-4" /> New Project</button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {stats.map((s) => (
                      <div key={s.label} className="rounded-2xl border border-line bg-white p-5 shadow-card">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", s.color)}><s.icon className="h-5 w-5" /></span>
                        <p className="font-display mt-3 text-2xl font-extrabold text-charcoal"><Counter value={s.value} /></p>
                        <p className="text-[12.5px] font-semibold text-muted">{s.label}</p>
                        <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-bold text-emerald-600"><TrendingUp className="h-3.5 w-3.5" />{s.delta}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                      <div className="flex items-center justify-between">
                        <div><h3 className="font-display text-[16px] font-bold">Revenue Overview</h3><p className="text-[12px] text-muted">Monthly billed revenue · 2026</p></div>
                        <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[12px] font-bold text-emerald-600"><ArrowUpRight className="h-3.5 w-3.5" /> +24.6%</span>
                      </div>
                      <div className="mt-5 flex h-44 items-end gap-2">
                        {revenue.map((v, i) => (
                          <div key={i} className="group relative flex-1">
                            <motion.div
                              initial={{ height: 0 }} animate={{ height: `${(v / 120) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.05 }}
                              className={cn("w-full rounded-t-lg", i === revenue.length - 1 ? "bg-brand" : "bg-brand/15 group-hover:bg-brand/40")}
                              style={{ minHeight: 8 }}
                            />
                            {i % 2 === 0 && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-muted">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                      <h3 className="font-display text-[16px] font-bold">Traffic Sources</h3>
                      <p className="text-[12px] text-muted">Where quote requests come from</p>
                      <div className="mt-4 space-y-3.5">
                        {[
                          { l: "Organic Search", v: 42, c: "bg-brand" },
                          { l: "Referrals", v: 28, c: "bg-emerald-500" },
                          { l: "Social Media", v: 18, c: "bg-violet-500" },
                          { l: "Direct", v: 12, c: "bg-amber-500" },
                        ].map((r) => (
                          <div key={r.l}>
                            <div className="flex justify-between text-[12.5px] font-semibold"><span>{r.l}</span><span>{r.v}%</span></div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper"><motion.div initial={{ width: 0 }} animate={{ width: `${r.v}%` }} transition={{ duration: 0.8 }} className={cn("h-full rounded-full", r.c)} /></div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-xl bg-paper p-4 text-[12.5px]">
                        <p className="font-bold">Top page: <span className="text-brand">/services</span></p>
                        <p className="text-muted">8.2k views · 4.1% conversion to quote</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                      <div className="flex items-center justify-between p-5 pb-3">
                        <h3 className="font-display text-[16px] font-bold">Latest Quote Requests</h3>
                        <button onClick={() => setTab("quotes")} className="text-[13px] font-bold text-brand">View all →</button>
                      </div>
                      <div className="divide-y divide-line">
                        {mockQuotes.slice(0, 4).map((q) => (
                          <div key={q.contact} className="flex items-center gap-3 px-5 py-3.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-[12px] font-bold text-white">{q.contact.split(" ").map((w) => w[0]).join("")}</span>
                            <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-bold">{q.name}</span><span className="block truncate text-[12px] text-muted">{q.service} · {q.budget}</span></span>
                            <StatusPill s={q.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                      <div className="flex items-center justify-between p-5 pb-3">
                        <h3 className="font-display text-[16px] font-bold">Recent Messages</h3>
                        <button onClick={() => setTab("messages")} className="text-[13px] font-bold text-brand">View all →</button>
                      </div>
                      <div className="divide-y divide-line">
                        {mockMessages.slice(0, 4).map((m) => (
                          <div key={m.email} className="flex items-center gap-3 px-5 py-3.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-[12px] font-bold text-brand">{m.name.split(" ").map((w) => w[0]).join("")}</span>
                            <span className="min-w-0 flex-1"><span className="block truncate text-[13.5px] font-bold">{m.subject}</span><span className="block truncate text-[12px] text-muted">{m.name} · {m.date}</span></span>
                            <StatusPill s={m.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "projects" && (
                <>
                <TableCard title="Projects" sub="Manage portfolio case studies shown on the website." action="Add Project" onAction={() => setProjectModal({ mode: "add" })} searchValue={projectSearch} onSearch={setProjectSearch}>
                  {projectRows.filter((p) => `${p.name || ""} ${p.title || ""} ${p.category || ""} ${p.client || ""}`.toLowerCase().includes(projectSearch.toLowerCase())).map((p) => (
                    <div key={p.slug} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                      <img src={p.image} alt={p.name} className="hidden h-12 w-16 rounded-lg object-cover sm:block" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold">{p.name}</span><span className="block text-[12px] text-muted">{p.category} · {p.client} · {p.year}</span></span>
                      <span className="hidden md:block"><StatusPill s="Live" /></span>
                      <RowActions onEdit={() => setProjectModal({ mode: "edit", item: p })} onDelete={() => deleteProject(p)} onView={() => setProjectModal({ mode: "edit", item: p })} />
                    </div>
                  ))}
                </TableCard>
                {projectMessage && <p className="p-4 text-sm text-red-600">{projectMessage}</p>}
                </>
              )}

              {tab === "services" && (
                <TableCard title="Services" sub="Control the 8 services displayed across the site." action="Add Service">
                  {["Web Development", "Mobile App Development", "UI/UX Design", "Software Development", "E-Commerce Development", "AI & Automation", "Cloud Solutions", "Maintenance & Support"].map((s, i) => (
                    <div key={s} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-[12px] font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{s}</span><span className="block text-[12px] text-muted">8 features · visible on homepage</span></span>
                      <span className="hidden md:block"><StatusPill s="Live" /></span>
                      <RowActions />
                    </div>
                  ))}
                </TableCard>
              )}

              {tab === "team" && (
                <TableCard title="Team Members" sub="Manage profiles shown on Team page." action="Add Member">
                  {team.map((m) => (
                    <div key={m.name} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                      <img src={m.image} alt={m.name} className="h-11 w-11 rounded-xl object-cover" />
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{m.name}</span><span className="block truncate text-[12px] text-muted">{m.role} · {m.location}</span></span>
                      <span className="hidden md:block"><StatusPill s="Live" /></span>
                      <RowActions />
                    </div>
                  ))}
                </TableCard>
              )}

              {tab === "testimonials" && (
                <TableCard title="Testimonials" sub="Client reviews rotating on the homepage." action="Add Testimonial">
                  {testimonials.map((t) => (
                    <div key={t.name} className="gap-4 border-b border-line px-5 py-4 last:border-0 sm:flex sm:items-center">
                      <img src={t.image} alt={t.name} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{t.name} · {t.company}</span><span className="block truncate text-[12px] text-muted">"{t.review.slice(0, 80)}…"</span></span>
                      <span className="mt-2 flex items-center gap-2 sm:mt-0"><span className="text-[12px] font-bold text-amber-500">★ {t.rating}.0</span><RowActions /></span>
                    </div>
                  ))}
                </TableCard>
              )}

              {tab === "blog" && (
                <TableCard title="Blog Posts" sub="Publish insights & manage categories." action="New Post">
                  {blogPosts.map((p) => (
                    <div key={p.slug} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                      <img src={p.image} alt={p.title} className="hidden h-12 w-16 rounded-lg object-cover sm:block" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold">{p.title}</span><span className="block text-[12px] text-muted">{p.category} · {p.date} · {p.readTime}</span></span>
                      <span className="hidden md:block"><StatusPill s={p.featured ? "Live" : "Live"} /></span>
                      <RowActions />
                    </div>
                  ))}
                </TableCard>
              )}

              {tab === "careers" && (
                <div className="space-y-5">
                  <TableCard title="Open Positions" sub={`${jobs.length} roles currently published.`} action="Post a Job">
                    {jobs.map((j) => (
                      <div key={j.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                        <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{j.title}</span><span className="block text-[12px] text-muted">{j.department} · {j.location} · {j.type}</span></span>
                        <span className="hidden md:block"><StatusPill s="Live" /></span>
                        <RowActions />
                      </div>
                    ))}
                  </TableCard>
                  <TableCard title="Job Applications" sub="Candidates waiting for review." action="Export CSV">
                    {mockApps.map((a) => (
                      <div key={a.name} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-[12px] font-bold text-brand">{a.name.split(" ").map((w) => w[0]).join("")}</span>
                        <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{a.name}</span><span className="block text-[12px] text-muted">{a.role} · {a.exp} · {a.date}</span></span>
                        <StatusPill s={a.status} />
                        <div className="hidden sm:block"><RowActions /></div>
                      </div>
                    ))}
                  </TableCard>
                </div>
              )}

              {tab === "messages" && (
                <TableCard title="Contact Messages" sub="Inquiries from the contact form." action="Mark all read">
                  {mockMessages.map((m) => (
                    <div key={m.email} className="gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex sm:items-center">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-[12px] font-bold text-brand">{m.name.split(" ").map((w) => w[0]).join("")}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold">{m.subject}</span><span className="block truncate text-[12px] text-muted">{m.name} · {m.email} · {m.service}</span></span>
                      <span className="mt-2 flex items-center gap-2 sm:mt-0"><span className="text-[11.5px] text-muted">{m.date}</span><StatusPill s={m.status} /><RowActions /></span>
                    </div>
                  ))}
                </TableCard>
              )}

              {tab === "quotes" && (
                <TableCard title="Quote Requests" sub="Leads from the Get-a-Quote system." action="Export leads">
                  {mockQuotes.map((q) => (
                    <div key={q.contact} className="gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex sm:items-center">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-[12px] font-bold text-white">{q.contact.split(" ").map((w) => w[0]).join("")}</span>
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{q.name} <span className="font-normal text-muted">· {q.contact}</span></span><span className="block text-[12px] text-muted">{q.service} · Budget {q.budget}</span></span>
                      <span className="mt-2 flex items-center gap-2 sm:mt-0"><span className="text-[11.5px] text-muted">{q.date}</span><StatusPill s={q.status} /><RowActions /></span>
                    </div>
                  ))}
                </TableCard>
              )}

              {tab === "settings" && (
                <div className="grid gap-5 lg:grid-cols-2">
                  {[
                    { t: "General Settings", d: "Site name, tagline, logo & contact details.", rows: [["Site name", "CodeCraft Solutions"], ["Support email", "support@codecraftsolutions.com"], ["Phone", "+1 (555) 012-3456"]] },
                    { t: "SEO & Analytics", d: "Meta defaults, sitemap & tracking.", rows: [["Meta title", "CodeCraft Solutions — Software House"], ["Analytics", "Connected ✓"], ["Sitemap", "Auto-generated"]] },
                    { t: "Notifications", d: "Email alerts for new leads & messages.", rows: [["Quote alerts", "Enabled"], ["Message alerts", "Enabled"], ["Weekly digest", "Mondays 9am"]] },
                    { t: "Team Access", d: "Roles & permissions for admins.", rows: [["Admins", "3 users"], ["Editors", "5 users"], ["2FA enforced", "Yes"]] },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl border border-line bg-white p-6 shadow-card">
                      <h3 className="font-display text-[16px] font-bold">{c.t}</h3>
                      <p className="text-[12.5px] text-muted">{c.d}</p>
                      <div className="mt-4 space-y-2.5">
                        {c.rows.map((r) => (
                          <div key={r[0]} className="flex items-center justify-between rounded-xl bg-paper px-4 py-2.5 text-[13px]">
                            <span className="font-semibold text-muted">{r[0]}</span><span className="font-bold">{r[1]}</span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-4 w-full rounded-xl border border-line py-2.5 text-[13px] font-bold transition hover:border-brand hover:text-brand">Edit {c.t}</button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {projectModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
        <form onSubmit={saveProject} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between"><h2 className="font-display text-xl font-extrabold">{projectModal.mode === "add" ? "Add Project" : "Edit Project"}</h2><button type="button" onClick={() => setProjectModal(null)} className="text-2xl text-muted">×</button></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[["name","Project name"],["slug","Slug"],["category","Category"],["client","Client"],["year","Year"],["duration","Duration"],["image","Image URL"],["technologies","Technologies (comma separated)"],["results","Results (comma separated)"],["description","Short description"]].map(([name,label]) => <label key={name} className="text-sm font-semibold">{label}<input name={name} required={!["image","technologies","results","duration"].includes(name)} defaultValue={projectModal.item?.[name] || (name === "technologies" ? (Array.isArray(projectModal.item?.technologies) ? projectModal.item.technologies.join(", ") : "") : (name === "results" ? (Array.isArray(projectModal.item?.results) ? projectModal.item.results.join(", ") : "") : ""))} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>)}
            <label className="text-sm font-semibold sm:col-span-2">Detailed description<textarea name="long_description" rows={3} defaultValue={projectModal.item?.long_description || projectModal.item?.description || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
          </div>
          <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setProjectModal(null)} className="rounded-xl border border-line px-4 py-2.5 font-semibold">Cancel</button><button className="btn-primary rounded-xl px-5 py-2.5 font-semibold">Save Project</button></div>
        </form>
      </div>}
    </div>
  );
}

function TableCard({ title, sub, action, onAction, searchValue, onSearch, children }: { title: string; sub: string; action: string; onAction?: () => void; searchValue?: string; onSearch?: (value: string) => void; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div><h2 className="font-display text-lg font-extrabold">{title}</h2><p className="text-[13px] text-muted">{sub}</p></div>
        <div className="flex gap-2">
          {onSearch ? <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input value={searchValue || ""} onChange={(event) => onSearch(event.target.value)} placeholder="Search..." className="w-36 rounded-xl border border-line py-2.5 pl-9 pr-3 text-[13px]" /></label> : <button className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold"><Search className="h-4 w-4" /> Search</button>}
          <button className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold"><Plus className="h-4 w-4" /> {action}</button>
        </div>
      </div>
      <div className="border-t border-line">{children}</div>
      <div className="flex items-center justify-between border-t border-line bg-paper/60 px-5 py-3 text-[12px] text-muted">
        <span>Showing all items</span>
        <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Last synced just now</span>
      </div>
    </div>
  );
}

export function AdminIcons() {
  return <span className="hidden"><XCircle /><CheckCircle2 /></span>;
}
