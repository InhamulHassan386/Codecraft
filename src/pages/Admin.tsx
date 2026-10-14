import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, Briefcase, Users, MessageSquare, FileText, PenLine,
  Quote as QuoteIcon, Settings, Search, Bell, ChevronDown, Plus, Eye, Pencil, Trash2,
  TrendingUp, ArrowUpRight, CheckCircle2, Clock3, XCircle, Menu, X, LogOut, Filter,
  Star, ChevronLeft, ChevronRight, ExternalLink,
} from "lucide-react";
import { team, blogPosts, jobs, testimonials } from "../data/content";
import { Counter } from "../components/layout";
import { cn } from "../utils/cn";

type Tab = "dashboard" | "projects" | "services" | "team" | "testimonials" | "blog" | "careers" | "messages" | "quotes" | "settings";

const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban, badge: 0 },
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
    Published: "bg-emerald-100 text-emerald-700",
    Hidden: "bg-amber-100 text-amber-700",
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
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("cc_admin_token") || "");
  const authed = authToken !== "";
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [dashboardRefresh, setDashboardRefresh] = useState(0);
  const [liveStats, setLiveStats] = useState({ projects: 0, messages: 0, quotes: 0, services: 0, team: 0, testimonials: 0, blogs: 0, jobs: 0, applications: 0 });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [projectList, setProjectList] = useState<any>({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 1, counts: { total: 0, published: 0, draft: 0, hidden: 0, featured: 0 }, categories: [] });
  const [projectQuery, setProjectQuery] = useState({ q: "", category: "", status: "", page: 1 });
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [projectRefresh, setProjectRefresh] = useState(0);
  const [projectModal, setProjectModal] = useState<{ mode: "add" | "edit" | "view"; item?: any } | null>(null);
  const [projectNotice, setProjectNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [projectFormError, setProjectFormError] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailChanged, setThumbnailChanged] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryChanged, setGalleryChanged] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");

  const signOut = (message = "") => {
    sessionStorage.removeItem("cc_admin_token");
    setAuthToken("");
    setLoginError(message);
    setProjectModal(null);
    setProjectNotice(null);
  };
  const adminFetch = async (url: string, init: { method?: string; body?: string } = {}) => {
    const response = await fetch(url, {
      method: init.method || "GET",
      body: init.body,
      cache: "no-store",
      headers: { Authorization: `Bearer ${authToken}`, ...(init.body ? { "Content-Type": "application/json" } : {}) },
    });
    if (response.status === 401) {
      const message = "Your session has expired. Please sign in again.";
      signOut(message);
      throw new Error(message);
    }
    return response;
  };
  const readError = async (response: Response, fallback: string) => {
    const data = await response.json().catch(() => ({}));
    return data.error || fallback;
  };
  const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoginBusy(true);
    setLoginError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(form.get("email") || ""), password: String(form.get("password") || "") }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token) throw new Error(data.error || "Sign-in failed. Check your email and password.");
      sessionStorage.setItem("cc_admin_token", data.token);
      setAuthToken(data.token);
    } catch (error) {
      const network = error instanceof TypeError;
      setLoginError(network ? "Cannot reach the server. Make sure the API is running." : error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setLoginBusy(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setProjectsLoading(true);
      setProjectsError("");
      try {
        const params = new URLSearchParams({ page: String(projectQuery.page), pageSize: "10" });
        if (projectQuery.q.trim()) params.set("q", projectQuery.q.trim());
        if (projectQuery.category) params.set("category", projectQuery.category);
        if (projectQuery.status) params.set("status", projectQuery.status);
        const response = await adminFetch(`/api/projects?${params.toString()}`);
        if (!response.ok) throw new Error(await readError(response, "Projects could not be loaded."));
        const data = await response.json();
        if (!cancelled) setProjectList(data);
      } catch (error) {
        if (!cancelled) setProjectsError(error instanceof Error ? error.message : "Projects could not be loaded.");
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, projectQuery, projectRefresh]);

  const resetProjectForm = () => {
    setThumbnail("");
    setThumbnailChanged(false);
    setGallery([]);
    setGalleryChanged(false);
    setGalleryUrl("");
    setProjectFormError("");
  };
  const closeProjectModal = () => {
    setProjectModal(null);
    resetProjectForm();
  };
  const openAddProject = () => {
    setProjectNotice(null);
    resetProjectForm();
    setProjectModal({ mode: "add" });
  };
  const openProject = async (item: any, mode: "view" | "edit") => {
    setProjectNotice(null);
    setProjectDetailLoading(true);
    try {
      // Always load the selected record by its ID so the dialog shows the database values, not the list row.
      const response = await adminFetch(`/api/projects/${item.id}`);
      if (!response.ok) throw new Error(await readError(response, "Could not load this project."));
      const fresh = await response.json();
      resetProjectForm();
      setThumbnail(fresh.image || "");
      setGallery(Array.isArray(fresh.gallery) ? fresh.gallery : []);
      setProjectModal({ mode, item: fresh });
    } catch (error) {
      setProjectNotice({ type: "error", text: error instanceof Error ? error.message : "Could not load this project." });
    } finally {
      setProjectDetailLoading(false);
    }
  };
  const readImageFile = (file: File, onData: (data: string) => void) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setProjectFormError("Upload a JPG, PNG, WEBP or GIF image.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setProjectFormError("Image must be 3 MB or smaller.");
      return;
    }
    setProjectFormError("");
    const reader = new FileReader();
    reader.onload = () => onData(String(reader.result));
    reader.readAsDataURL(file);
  };
  const addGalleryUrl = () => {
    const value = galleryUrl.trim();
    if (!value) return;
    if (gallery.length >= 8) { setProjectFormError("A project can have at most 8 gallery images."); return; }
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch {
      setProjectFormError("Gallery image must be a valid http(s) URL.");
      return;
    }
    setProjectFormError("");
    setGallery((items) => [...items, value]);
    setGalleryChanged(true);
    setGalleryUrl("");
  };

  const saveProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) || "").trim();
    const editing = projectModal?.mode === "edit" && !!projectModal.item?.id;
    const payload: Record<string, unknown> = {
      name: text("name"),
      slug: text("slug"),
      category: text("category"),
      client: text("client"),
      year: text("year"),
      duration: text("duration"),
      description: text("description"),
      long_description: text("long_description"),
      technologies: text("technologies"),
      results: text("results"),
      live_url: text("live_url"),
      github_url: text("github_url"),
      display_order: text("display_order") || "0",
      published: text("status") === "published",
      visible: text("visibility") === "visible",
      featured: form.get("featured") === "on",
    };
    if (!editing || thumbnailChanged) payload.image = thumbnail;
    if (!editing || galleryChanged) payload.gallery = gallery;
    setProjectSaving(true);
    setProjectFormError("");
    try {
      const response = await adminFetch(editing ? `/api/projects/${projectModal?.item.id}` : "/api/projects", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setProjectFormError(await readError(response, "Project could not be saved."));
        return;
      }
      const saved = await response.json();
      closeProjectModal();
      setProjectNotice({ type: "success", text: editing ? `"${saved.name}" was updated.` : `"${saved.name}" was added.` });
      setProjectRefresh((n) => n + 1);
      setDashboardRefresh((n) => n + 1);
    } catch (error) {
      setProjectFormError(error instanceof Error ? error.message : "Project could not be saved.");
    } finally {
      setProjectSaving(false);
    }
  };
  const deleteProject = async (item: any) => {
    if (!window.confirm(`Delete "${item.name}"? This permanently removes this project. This cannot be undone.`)) return;
    setProjectNotice(null);
    try {
      const response = await adminFetch(`/api/projects/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await readError(response, "Project could not be deleted."));
      setProjectNotice({ type: "success", text: `"${item.name}" was deleted.` });
      if (projectList.items.length === 1 && projectQuery.page > 1) setProjectQuery((current) => ({ ...current, page: current.page - 1 }));
      setProjectRefresh((n) => n + 1);
      setDashboardRefresh((n) => n + 1);
    } catch (error) {
      setProjectNotice({ type: "error", text: error instanceof Error ? error.message : "Project could not be deleted." });
    }
  };

  useEffect(() => { fetch("/api/dashboard/recent").then((r) => r.ok ? r.json() : Promise.reject()).then((data) => { setRecentMessages(data.messages || []); setRecentQuotes(data.quotes || []); }).catch(() => {}).finally(() => setDashboardLoading(false)); fetch("/api/dashboard/summary").then((r) => r.ok ? r.json() : Promise.reject()).then((summary) => setLiveStats({ projects: summary.projects || 0, messages: summary.contact_messages || 0, quotes: summary.quote_requests || 0, services: summary.services || 0, team: summary.team_members || 0, testimonials: summary.testimonials || 0, blogs: summary.blog_posts || 0, jobs: summary.jobs || 0, applications: summary.job_applications || 0 })).catch(() => {}); }, [dashboardRefresh]);

  const stats = useMemo(() => [
    { label: "Total Projects", value: liveStats.projects, icon: FolderKanban, delta: "+4 this month", color: "bg-brand" },
    { label: "Total Messages", value: liveStats.messages, icon: MessageSquare, delta: "+12 unread", color: "bg-violet-500" },
    { label: "Applications", value: liveStats.applications, icon: FileText, delta: "+9 this week", color: "bg-amber-500" },
    { label: "Blog Posts", value: blogPosts.length, icon: PenLine, delta: "2 drafts", color: "bg-emerald-500" },
    { label: "Quote Requests", value: liveStats.quotes, icon: QuoteIcon, delta: "7 pending", color: "bg-rose-500" },
  ], [liveStats]);

  if (!authed) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-paper px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-card sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink"><LayoutDashboard className="h-6 w-6 text-white" /></span>
          <h1 className="font-display mt-5 text-center text-2xl font-extrabold text-charcoal">Admin Panel</h1>
          <p className="mt-1.5 text-center text-sm text-muted">Sign in with your administrator account to manage content, projects & inquiries.</p>
          <form className="mt-7 space-y-4" onSubmit={signIn}>
            <div><label className="mb-1.5 block text-[13px] font-semibold">Email</label><input name="email" type="email" required autoComplete="username" className="w-full rounded-xl border border-line px-4 py-3 text-sm" /></div>
            <div><label className="mb-1.5 block text-[13px] font-semibold">Password</label><input name="password" type="password" required autoComplete="current-password" className="w-full rounded-xl border border-line px-4 py-3 text-sm" /></div>
            {loginError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{loginError}</p>}
            <button type="submit" disabled={loginBusy} className="btn-primary w-full rounded-xl px-6 py-3.5 text-sm font-semibold disabled:opacity-60">{loginBusy ? "Signing in…" : "Sign In to Dashboard"}</button>
          </form>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-muted"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Protected admin access</p>
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
          <button onClick={() => signOut()} className="hidden h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-red-600 sm:flex">
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
                {(t.id === "projects" ? projectList.counts.total : t.badge) != null && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-bold", tab === t.id ? "bg-white/15 text-white" : "bg-paper-2 text-charcoal")}>{t.id === "projects" ? projectList.counts.total : t.badge}</span>
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
                      <p className="text-sm text-muted">Here's what's happening across your website today.</p>{dashboardLoading && <p className="text-xs text-brand">Loading live data...</p>}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-semibold"><Filter className="h-4 w-4" /> Last 30 days</button>
                      <button onClick={() => { setTab("projects"); openAddProject(); }} className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold"><Plus className="h-4 w-4" /> New Project</button>
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
                        {(recentQuotes.length ? recentQuotes : mockQuotes.slice(0, 4)).map((q: any) => (
                          <div key={q.contact} className="flex items-center gap-3 px-5 py-3.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-[12px] font-bold text-white">{q.contact.split(" ").map((w: string) => w[0]).join("")}</span>
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
                        {(recentMessages.length ? recentMessages : mockMessages.slice(0, 4)).map((m: any) => (
                          <div key={m.email} className="flex items-center gap-3 px-5 py-3.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-[12px] font-bold text-brand">{m.name.split(" ").map((w: string) => w[0]).join("")}</span>
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
                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[["Total projects", projectList.counts.total], ["Published", projectList.counts.published], ["Drafts", projectList.counts.draft], ["Featured", projectList.counts.featured]].map(([label, value]) => (
                    <div key={String(label)} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                      <p className="font-display text-xl font-extrabold text-charcoal">{value}</p>
                      <p className="text-[12.5px] font-semibold text-muted">{label}</p>
                    </div>
                  ))}
                </div>
                {projectNotice && (
                  <div role="status" className={cn("mb-4 rounded-xl border px-4 py-3 text-sm font-semibold", projectNotice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600")}>{projectNotice.text}</div>
                )}
                {projectDetailLoading && <p className="mb-3 text-sm font-medium text-muted">Loading project details…</p>}
                <TableCard
                  title="Projects"
                  sub="Manage portfolio case studies shown on the website."
                  action="Add Project"
                  onAction={openAddProject}
                  searchValue={projectQuery.q}
                  onSearch={(q) => setProjectQuery((current) => ({ ...current, q, page: 1 }))}
                  filters={
                    <>
                      <select value={projectQuery.category} onChange={(event) => setProjectQuery((current) => ({ ...current, category: event.target.value, page: 1 }))} className="rounded-xl border border-line px-3 py-2.5 text-[13px]" aria-label="Filter by category">
                        <option value="">All categories</option>
                        {projectList.categories.map((category: string) => <option key={category} value={category}>{category}</option>)}
                      </select>
                      <select value={projectQuery.status} onChange={(event) => setProjectQuery((current) => ({ ...current, status: event.target.value, page: 1 }))} className="rounded-xl border border-line px-3 py-2.5 text-[13px]" aria-label="Filter by status">
                        <option value="">All status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </>
                  }
                  footer={
                    <>
                      <span>{projectList.total === 0 ? "No matching projects" : `Page ${projectList.page} of ${projectList.totalPages} · ${projectList.total} total`}</span>
                      <span className="flex items-center gap-2">
                        <button disabled={projectQuery.page <= 1} onClick={() => setProjectQuery((current) => ({ ...current, page: current.page - 1 }))} className="flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-3 font-semibold text-charcoal disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /> Prev</button>
                        <button disabled={projectQuery.page >= projectList.totalPages} onClick={() => setProjectQuery((current) => ({ ...current, page: current.page + 1 }))} className="flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-3 font-semibold text-charcoal disabled:opacity-40">Next <ChevronRight className="h-3.5 w-3.5" /></button>
                      </span>
                    </>
                  }
                >
                  {projectsLoading && <p className="p-5 text-sm text-muted">Loading projects…</p>}
                  {!projectsLoading && projectsError && (
                    <div className="p-5">
                      <p className="text-sm font-semibold text-red-600">{projectsError}</p>
                      <button onClick={() => setProjectRefresh((n) => n + 1)} className="mt-3 rounded-xl border border-line px-4 py-2 text-sm font-semibold">Retry</button>
                    </div>
                  )}
                  {!projectsLoading && !projectsError && projectList.items.length === 0 && (
                    <p className="p-5 text-sm text-muted">{projectQuery.q || projectQuery.category || projectQuery.status ? "No projects match these filters." : "No projects yet. Click Add Project to create the first one."}</p>
                  )}
                  {!projectsError && projectList.items.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                      {p.image ? <img src={p.image} alt={p.name} className="hidden h-12 w-16 rounded-lg object-cover sm:block" /> : <span className="hidden h-12 w-16 rounded-lg bg-paper sm:block" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold">{p.name}</span>
                        <span className="block truncate text-[12px] text-muted">{p.category} · {p.client} · {p.year}</span>
                      </span>
                      <span className="hidden flex-wrap items-center justify-end gap-1.5 md:flex">
                        {p.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700"><Star className="h-3 w-3" /> Featured</span>}
                        <StatusPill s={p.status} />
                        {!p.visible && <StatusPill s="Hidden" />}
                      </span>
                      <RowActions onView={() => openProject(p, "view")} onEdit={() => openProject(p, "edit")} onDelete={() => deleteProject(p)} />
                    </div>
                  ))}
                </TableCard>
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
                  {team.map((m: any) => (
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
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-[12px] font-bold text-brand">{a.name.split(" ").map((w: string) => w[0]).join("")}</span>
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
                  {mockMessages.map((m: any) => (
                    <div key={m.email} className="gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex sm:items-center">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-[12px] font-bold text-brand">{m.name.split(" ").map((w: string) => w[0]).join("")}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold">{m.subject}</span><span className="block truncate text-[12px] text-muted">{m.name} · {m.email} · {m.service}</span></span>
                      <span className="mt-2 flex items-center gap-2 sm:mt-0"><span className="text-[11.5px] text-muted">{m.date}</span><StatusPill s={m.status} /><RowActions /></span>
                    </div>
                  ))}
                </TableCard>
              )}

              {tab === "quotes" && (
                <TableCard title="Quote Requests" sub="Leads from the Get-a-Quote system." action="Export leads">
                  {mockQuotes.map((q: any) => (
                    <div key={q.contact} className="gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex sm:items-center">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-[12px] font-bold text-white">{q.contact.split(" ").map((w: string) => w[0]).join("")}</span>
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
      {projectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          {projectModal.mode === "view" ? (
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-extrabold">{projectModal.item.name}</h2>
                  <p className="text-[12.5px] text-muted">/{projectModal.item.slug}</p>
                </div>
                <button type="button" onClick={closeProjectModal} aria-label="Close project dialog" className="text-2xl text-muted">×</button>
              </div>
              {projectModal.item.image && <img src={projectModal.item.image} alt={projectModal.item.name} className="mt-4 h-56 w-full rounded-xl object-cover" />}
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill s={projectModal.item.status} />
                {!projectModal.item.visible && <StatusPill s="Hidden" />}
                {projectModal.item.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700"><Star className="h-3 w-3" /> Featured</span>}
                <span className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-bold text-charcoal">{projectModal.item.category}</span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                {[["Client", projectModal.item.client], ["Year", projectModal.item.year], ["Duration", projectModal.item.duration], ["Display order", projectModal.item.display_order], ["Last updated", projectModal.item.updated_at ? new Date(projectModal.item.updated_at).toLocaleString() : "—"]].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-paper p-3">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</dt>
                    <dd className="mt-1 font-semibold text-charcoal">{String(value ?? "—")}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-5 text-sm font-bold">Short description</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{projectModal.item.description}</p>
              <h3 className="mt-5 text-sm font-bold">Full description</h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">{projectModal.item.long_description || "—"}</p>
              <h3 className="mt-5 text-sm font-bold">Technologies</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {projectModal.item.technologies.length ? projectModal.item.technologies.map((t: string) => <span key={t} className="rounded-md bg-ink px-2.5 py-1 text-[12px] font-semibold text-white">{t}</span>) : <span className="text-sm text-muted">—</span>}
              </div>
              <h3 className="mt-5 text-sm font-bold">Results</h3>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {projectModal.item.results.length ? projectModal.item.results.map((r: any) => (
                  <div key={`${r.value}-${r.label}`} className="rounded-xl border border-brand/20 bg-brand-light p-3 text-center">
                    <p className="font-display text-lg font-extrabold text-brand">{r.value}</p>
                    <p className="text-[11.5px] font-medium text-charcoal/70">{r.label}</p>
                  </div>
                )) : <span className="text-sm text-muted">—</span>}
              </div>
              <h3 className="mt-5 text-sm font-bold">Links</h3>
              <div className="mt-2 flex flex-wrap gap-4 text-sm font-semibold text-brand">
                {projectModal.item.live_url ? <a href={projectModal.item.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">Live website <ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-muted">No live URL</span>}
                {projectModal.item.github_url ? <a href={projectModal.item.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">GitHub repository <ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-muted">No GitHub URL</span>}
              </div>
              {gallery.length > 0 && (
                <>
                  <h3 className="mt-5 text-sm font-bold">Gallery</h3>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {gallery.map((src, index) => <img key={index} src={src} alt={`${projectModal.item.name} ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />)}
                  </div>
                </>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={closeProjectModal} className="rounded-xl border border-line px-4 py-2.5 font-semibold">Close</button>
                <button type="button" onClick={() => { setProjectModal({ mode: "edit", item: projectModal.item }); setThumbnail(projectModal.item.image || ""); setGallery(Array.isArray(projectModal.item.gallery) ? projectModal.item.gallery : []); }} className="btn-primary rounded-xl px-5 py-2.5 font-semibold">Edit Project</button>
              </div>
            </div>
          ) : (
            <form key={`${projectModal.mode}-${projectModal.item?.id ?? "new"}`} onSubmit={saveProject} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold">{projectModal.mode === "add" ? "Add Project" : "Edit Project"}</h2>
                <button type="button" onClick={closeProjectModal} aria-label="Close project dialog" className="text-2xl text-muted">×</button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">Project name *<input name="name" required maxLength={255} defaultValue={projectModal.item?.name || ""} onChange={(event) => { const slug = event.currentTarget.form?.elements.namedItem("slug") as HTMLInputElement | null; if (slug && projectModal.mode === "add" && (slug.dataset.auto === "1" || !slug.value)) { slug.value = slugify(event.currentTarget.value); slug.dataset.auto = "1"; } }} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">Slug (unique URL id) *<input name="slug" required maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Lowercase letters, numbers and single hyphens" onInput={(event) => { event.currentTarget.dataset.auto = "0"; }} defaultValue={projectModal.item?.slug || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">Category *<input name="category" required maxLength={80} list="project-categories" defaultValue={projectModal.item?.category || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /><datalist id="project-categories">{projectList.categories.map((c: string) => <option key={c} value={c} />)}</datalist></label>
                <label className="text-sm font-semibold">Client *<input name="client" required maxLength={180} defaultValue={projectModal.item?.client || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">Year *<input name="year" required inputMode="numeric" pattern="\d{4}" title="Four digit year, e.g. 2026" defaultValue={projectModal.item?.year || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">Duration *<input name="duration" required maxLength={80} placeholder="e.g. 12 weeks" defaultValue={projectModal.item?.duration || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold sm:col-span-2">Short description *<textarea name="description" required maxLength={500} rows={2} defaultValue={projectModal.item?.description || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold sm:col-span-2">Full description<textarea name="long_description" rows={4} maxLength={20000} defaultValue={projectModal.item?.long_description || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold sm:col-span-2">Technologies (comma separated)<input name="technologies" placeholder="React, TypeScript, PHP, MySQL" defaultValue={(projectModal.item?.technologies || []).join(", ")} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold sm:col-span-2">Results (one per line, "value | label")<textarea name="results" rows={3} placeholder={"3.2x | Faster onboarding\n99.98% | Uptime"} defaultValue={(projectModal.item?.results || []).map((r: any) => `${r.value} | ${r.label}`).join("\n")} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">Live website URL<input name="live_url" type="url" maxLength={500} placeholder="https://" defaultValue={projectModal.item?.live_url || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">GitHub repository URL<input name="github_url" type="url" maxLength={500} placeholder="https://github.com/..." defaultValue={projectModal.item?.github_url || ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /></label>
                <label className="text-sm font-semibold">Status<select name="status" defaultValue={projectModal.item ? (projectModal.item.published ? "published" : "draft") : "draft"} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal"><option value="published">Published</option><option value="draft">Draft (private)</option></select></label>
                <label className="text-sm font-semibold">Visibility<select name="visibility" defaultValue={projectModal.item ? (projectModal.item.visible ? "visible" : "hidden") : "visible"} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal"><option value="visible">Visible on website</option><option value="hidden">Hidden from website</option></select></label>
                <label className="text-sm font-semibold">Display order<input name="display_order" type="number" min={0} max={100000} step={1} defaultValue={projectModal.item?.display_order ?? ""} placeholder="Auto" className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 font-normal" /><span className="mt-1 block text-[11.5px] font-normal text-muted">Lower numbers appear first.</span></label>
                <label className="flex items-center gap-2 self-end text-sm font-semibold"><input name="featured" type="checkbox" defaultChecked={!!projectModal.item?.featured} className="h-4 w-4" /> Featured project</label>
              </div>

              <div className="mt-4 rounded-xl border border-line p-4">
                <p className="text-sm font-semibold">Thumbnail image *</p>
                {thumbnail && <img src={thumbnail} alt="Thumbnail preview" className="mt-3 h-36 w-full rounded-lg object-cover" />}
                <input type="url" value={thumbnail.startsWith("data:") ? "" : thumbnail} onChange={(event) => { setThumbnail(event.target.value); setThumbnailChanged(true); }} placeholder={thumbnail.startsWith("data:") ? "Uploaded image in use (paste a URL to replace)" : "https://example.com/image.jpg"} className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal" />
                <p className="my-2 text-center text-xs font-semibold text-muted">OR</p>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) readImageFile(file, (data) => { setThumbnail(data); setThumbnailChanged(true); }); }} className="w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal" />
                <p className="mt-2 text-[11.5px] text-muted">JPG, PNG, WEBP or GIF, up to 3 MB. {projectModal.mode === "edit" && !thumbnailChanged ? "Current image will be kept." : ""}</p>
              </div>

              <div className="mt-3 rounded-xl border border-line p-4">
                <p className="text-sm font-semibold">Gallery (optional, up to 8)</p>
                {gallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {gallery.map((src, index) => (
                      <div key={index} className="relative">
                        <img src={src} alt={`Gallery ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />
                        <button type="button" aria-label={`Remove gallery image ${index + 1}`} onClick={() => { setGallery((items) => items.filter((_, i) => i !== index)); setGalleryChanged(true); }} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-ink/80 text-white"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <input type="url" value={galleryUrl} onChange={(event) => setGalleryUrl(event.target.value)} placeholder="Add image URL" className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2.5 text-sm font-normal" />
                  <button type="button" onClick={addGalleryUrl} className="flex items-center gap-1 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold"><Plus className="h-4 w-4" /> Add</button>
                </div>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { Array.from(event.target.files || []).forEach((file) => readImageFile(file, (data) => { setGallery((items) => (items.length >= 8 ? items : [...items, data])); setGalleryChanged(true); })); }} className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-sm font-normal" />
              </div>

              {projectFormError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{projectFormError}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={closeProjectModal} className="rounded-xl border border-line px-4 py-2.5 font-semibold">Cancel</button>
                <button type="submit" disabled={projectSaving} className="btn-primary rounded-xl px-5 py-2.5 font-semibold disabled:opacity-60">{projectSaving ? "Saving…" : "Save Project"}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function TableCard({ title, sub, action, onAction, searchValue, onSearch, filters, footer, children }: { title: string; sub: string; action: string; onAction?: () => void; searchValue?: string; onSearch?: (value: string) => void; filters?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div><h2 className="font-display text-lg font-extrabold">{title}</h2><p className="text-[13px] text-muted">{sub}</p></div>
        <div className="flex flex-wrap gap-2">
          {filters}
          {onSearch ? <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input value={searchValue || ""} onChange={(event) => onSearch(event.target.value)} placeholder="Search..." className="w-36 rounded-xl border border-line py-2.5 pl-9 pr-3 text-[13px]" /></label> : <button className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold"><Search className="h-4 w-4" /> Search</button>}
          <button onClick={onAction} className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold"><Plus className="h-4 w-4" /> {action}</button>
        </div>
      </div>
      <div className="border-t border-line">{children}</div>
      {footer ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-paper/60 px-5 py-3 text-[12px] text-muted">{footer}</div>
      ) : (
        <div className="flex items-center justify-between border-t border-line bg-paper/60 px-5 py-3 text-[12px] text-muted">
          <span>Showing all items</span>
          <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Last synced just now</span>
        </div>
      )}
    </div>
  );
}

export function AdminIcons() {
  return <span className="hidden"><XCircle /><CheckCircle2 /></span>;
}
