import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, Briefcase, Users, MessageSquare, FileText, PenLine,
  Quote as QuoteIcon, Settings, Search, Bell, ChevronDown, Plus, Pencil, Trash2, Loader2,
  TrendingUp, ArrowUpRight, CheckCircle2, Clock3, Menu, X, LogOut, Filter,
  Layers, Wrench,
} from "lucide-react";
import { Counter } from "../components/layout";
import { cn } from "../utils/cn";
import { useContent, setToken as persistToken, getToken, type AdminMessage, type AdminQuote } from "../data/ContentContext";
import { login as apiLogin, fetchMe, api } from "../data/api";

/* ============================================================================
   Fully dynamic admin panel.
   All content lives in MySQL (via server/) — every add / edit / delete here
   instantly updates the whole website. Falls back to read-only demo data when
   the API is unreachable.
============================================================================ */

type AdminUser = { name: string; email: string; role: string };
type Row = Record<string, any>;

type FieldType = "text" | "textarea" | "number" | "image" | "list" | "kv" | "items" | "toggle" | "select";
type Field = { key: string; label: string; type: FieldType; options?: string[]; placeholder?: string; wide?: boolean };

type EntityKey = "projects" | "services" | "techCategories" | "team" | "testimonials" | "blogPosts" | "jobs";

const ENTITY_CONFIG: Record<EntityKey, {
  entity: string; title: string; sub: string; add: string;
  titleKey: string; imageKey?: string; subLine: (r: Row) => string;
  fields: Field[];
}> = {
  projects: {
    entity: "projects", title: "Projects", sub: "Portfolio case studies shown on Home & Portfolio pages.", add: "Add Project",
    titleKey: "name", imageKey: "image", subLine: (r) => `${r.category || "—"} · ${r.client || "—"} · ${r.year || "—"}`,
    fields: [
      { key: "name", label: "Project Name", type: "text" },
      { key: "slug", label: "Slug (auto if empty)", type: "text", placeholder: "auto" },
      { key: "category", label: "Category", type: "select", options: ["Web", "Mobile", "UI/UX", "Software", "E-Commerce"] },
      { key: "client", label: "Client", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "duration", label: "Duration", type: "text", placeholder: "e.g. 12 weeks" },
      { key: "image", label: "Image URL", type: "image", wide: true },
      { key: "description", label: "Short Description", type: "textarea", wide: true },
      { key: "longDescription", label: "Long Description (case study)", type: "textarea", wide: true },
      { key: "technologies", label: "Technologies (one per line)", type: "list", wide: true },
      { key: "results", label: "Results — one per line: value | label", type: "kv", wide: true, placeholder: "2.4x | Conversion rate" },
    ],
  },
  services: {
    entity: "services", title: "Services", sub: "Services displayed on Home, Services pages & footer.", add: "Add Service",
    titleKey: "title", subLine: (r) => `${(r.features || []).length} features · ${(r.benefits || []).length} benefits`,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug (auto if empty)", type: "text" },
      { key: "icon", label: "Icon (lucide name)", type: "text", placeholder: "Globe, Smartphone, Cloud…" },
      { key: "tagline", label: "Tagline", type: "text", wide: true },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "features", label: "Features (one per line)", type: "list", wide: true },
      { key: "benefits", label: "Benefits (one per line)", type: "list", wide: true },
      { key: "technologies", label: "Technologies (one per line)", type: "list", wide: true },
      { key: "deliverables", label: "Deliverables (one per line)", type: "list", wide: true },
    ],
  },
  techCategories: {
    entity: "techCategories", title: "Technology Categories", sub: "Tech stacks shown on Home & Technologies pages.", add: "Add Category",
    titleKey: "title", subLine: (r) => `${(r.items || []).length} items`,
    fields: [
      { key: "title", label: "Category Title", type: "text" },
      { key: "icon", label: "Icon (lucide name)", type: "text" },
      { key: "blurb", label: "Blurb", type: "textarea", wide: true },
      { key: "items", label: "Items — one per line: name | description | level 0-100", type: "items", wide: true, placeholder: "React | Our go-to UI library | 97" },
    ],
  },
  team: {
    entity: "team", title: "Team Members", sub: "Profiles shown on Team page, Home & About.", add: "Add Member",
    titleKey: "name", imageKey: "image", subLine: (r) => `${r.role || "—"} · ${r.location || "—"}`,
    fields: [
      { key: "name", label: "Full Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "image", label: "Photo URL", type: "image", wide: true },
      { key: "bio", label: "Bio", type: "textarea", wide: true },
      { key: "skills", label: "Skills (one per line)", type: "list", wide: true },
    ],
  },
  testimonials: {
    entity: "testimonials", title: "Testimonials", sub: "Client reviews rotating on the homepage.", add: "Add Testimonial",
    titleKey: "name", imageKey: "image", subLine: (r) => `${r.role || "—"}, ${r.company || "—"} · ★ ${r.rating ?? 5}`,
    fields: [
      { key: "name", label: "Client Name", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      { key: "image", label: "Photo URL", type: "image", wide: true },
      { key: "review", label: "Review", type: "textarea", wide: true },
    ],
  },
  blogPosts: {
    entity: "blogPosts", title: "Blog Posts", sub: "Articles shown on Blog page & Home insights.", add: "New Post",
    titleKey: "title", imageKey: "image", subLine: (r) => `${r.category || "—"} · ${r.date || "—"} · ${r.readTime || "—"}`,
    fields: [
      { key: "title", label: "Title", type: "text", wide: true },
      { key: "slug", label: "Slug (auto if empty)", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "author", label: "Author", type: "text" },
      { key: "authorRole", label: "Author Role", type: "text" },
      { key: "date", label: "Date", type: "text", placeholder: "Sep 8, 2026" },
      { key: "readTime", label: "Read Time", type: "text", placeholder: "8 min read" },
      { key: "image", label: "Cover Image URL", type: "image", wide: true },
      { key: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { key: "featured", label: "Featured on homepage", type: "toggle" },
    ],
  },
  jobs: {
    entity: "jobs", title: "Open Positions", sub: "Job listings shown on the Careers page.", add: "Post a Job",
    titleKey: "title", subLine: (r) => `${r.department || "—"} · ${r.location || "—"} · ${r.type || "—"}`,
    fields: [
      { key: "title", label: "Job Title", type: "text" },
      { key: "slug", label: "Job ID / slug (auto if empty)", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "type", label: "Type", type: "select", options: ["Full-Time", "Part-Time", "Contract", "Internship", "Remote"] },
      { key: "experience", label: "Experience", type: "text", placeholder: "3+ years" },
      { key: "posted", label: "Posted date", type: "text", placeholder: "Sep 10, 2026" },
      { key: "description", label: "Description", type: "textarea", wide: true },
      { key: "skills", label: "Skills (one per line)", type: "list", wide: true },
      { key: "responsibilities", label: "Responsibilities (one per line)", type: "list", wide: true },
    ],
  },
};

const TAB_TO_ENTITY: Record<string, EntityKey> = {
  projects: "projects",
  services: "services",
  tech: "techCategories",
  team: "team",
  testimonials: "testimonials",
  blog: "blogPosts",
  careers: "jobs",
};

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

/* ------------------------------ value codecs ------------------------------ */
function toFormValue(f: Field, v: any): string | boolean {
  switch (f.type) {
    case "toggle":
      return Boolean(v);
    case "number":
      return v == null ? "" : String(v);
    case "list":
      return Array.isArray(v) ? v.join("\n") : "";
    case "kv":
      return Array.isArray(v) ? v.map((p: any) => `${p.value ?? p.label ?? ""} | ${p.label ?? ""}`).join("\n") : "";
    case "items":
      return Array.isArray(v) ? v.map((it: any) => `${it.name} | ${it.description} | ${it.level}`).join("\n") : "";
    default:
      return v == null ? "" : String(v);
  }
}
function fromFormValue(f: Field, raw: string | boolean): any {
  switch (f.type) {
    case "toggle":
      return Boolean(raw);
    case "number":
      return raw === "" ? 5 : Number(raw);
    case "list":
      return String(raw).split("\n").map((s) => s.trim()).filter(Boolean);
    case "kv":
      return String(raw).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
        const [value, label] = l.split("|").map((s) => s.trim());
        return { value: value || "", label: label || value || "" };
      });
    case "items":
      return String(raw).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
        const [name, description, level] = l.split("|").map((s) => s.trim());
        return { name: name || "", description: description || "", level: Number(level) || 90 };
      });
    default:
      return String(raw);
  }
}

/* ------------------------------ form modal ------------------------------ */
function ItemFormModal({ entityKey, initial, onClose, onSaved }: {
  entityKey: EntityKey;
  initial: Row | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const cfg = ENTITY_CONFIG[entityKey];
  const { createItem, updateItem } = useContent();
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const v: Record<string, string | boolean> = {};
    for (const f of cfg.fields) v[f.key] = toFormValue(f, initial?.[f.key]);
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, val: string | boolean) => setValues((p) => ({ ...p, [k]: val }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload: Row = {};
      for (const f of cfg.fields) payload[f.key] = fromFormValue(f, values[f.key]);
      if (initial?.id) await updateItem(cfg.entity, initial.id, payload);
      else await createItem(cfg.entity, payload);
      onSaved(initial?.id ? `${cfg.title.slice(0, -1)} updated ✓` : `${cfg.title.slice(0, -1)} added ✓`);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-extrabold">{initial?.id ? "Edit" : cfg.add}</h3>
            <p className="text-[12px] text-muted">{cfg.title} · saved straight to the database</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg bg-paper text-charcoal transition hover:bg-paper-2"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          {cfg.fields.map((f) => {
            const val = values[f.key];
            const cls = "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-muted-2 transition focus:border-brand";
            return (
              <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-[13px] font-semibold text-charcoal">{f.label}</label>
                {f.type === "textarea" || f.type === "list" || f.type === "kv" || f.type === "items" ? (
                  <textarea rows={f.type === "textarea" ? 3 : 4} value={String(val)} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} className={cn(cls, "resize-none font-mono text-[12.5px] leading-relaxed")} />
                ) : f.type === "toggle" ? (
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-paper px-4 py-2.5">
                    <input type="checkbox" checked={Boolean(val)} onChange={(e) => set(f.key, e.target.checked)} className="h-4 w-4 accent-blue-600" />
                    <span className="text-[13px] font-semibold text-charcoal">{val ? "Yes" : "No"}</span>
                  </label>
                ) : f.type === "select" ? (
                  <select value={String(val)} onChange={(e) => set(f.key, e.target.value)} className={cls}>
                    <option value="">Select…</option>
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "image" ? (
                  <div className="flex items-center gap-3">
                    {val ? <img src={String(val)} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-line object-cover" /> : <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-muted"><Pencil className="h-4 w-4" /></span>}
                    <input value={String(val)} placeholder="https://…" onChange={(e) => set(f.key, e.target.value)} className={cls} />
                  </div>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    value={String(val)}
                    placeholder={f.placeholder}
                    onChange={(e) => set(f.key, e.target.value)}
                    className={cls}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line bg-paper/60 px-6 py-4">
          {error ? <p className="text-[12px] font-semibold text-red-500">{error}</p> : <p className="text-[12px] text-muted">Tip: lists are one item per line.</p>}
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-line px-5 py-2.5 text-[13px] font-semibold text-charcoal transition hover:border-charcoal">Cancel</button>
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {initial?.id ? "Save Changes" : "Create"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------ entity table ------------------------------ */
function EntityTable({ entityKey, onEdit, toast }: {
  entityKey: EntityKey;
  onEdit: (row: Row) => void;
  toast: (msg: string) => void;
}) {
  const cfg = ENTITY_CONFIG[entityKey];
  const content = useContent();
  const items = (content as any)[cfg.entity] as Row[];
  const { deleteItem, isDynamic } = content;
  const [busyId, setBusyId] = useState<number | null>(null);

  const del = async (row: Row) => {
    if (!window.confirm(`Delete "${row[cfg.titleKey]}"? This is permanent.`)) return;
    setBusyId(row.id);
    try {
      await deleteItem(cfg.entity, row.id);
      toast("Deleted ✓");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <TableCard title={cfg.title} sub={cfg.sub} action={cfg.add} onAction={() => onEdit({})} right={<Badge n={items.length} />} disabled={!isDynamic}>
      {items.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">Nothing here yet — click "{cfg.add}" to create the first one.</p>}
      {items.map((r) => (
        <div key={r.id ?? r.slug} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
          {cfg.imageKey ? (
            <img src={r[cfg.imageKey]} alt={r[cfg.titleKey]} className="hidden h-12 w-16 rounded-lg object-cover sm:block" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-mono text-[12px] font-bold text-white">{String(r[cfg.titleKey] || "?").slice(0, 2).toUpperCase()}</span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold">{r[cfg.titleKey]}</span>
            <span className="block truncate text-[12px] text-muted">{cfg.subLine(r)}</span>
          </span>
          <span className="hidden md:block"><StatusPill s="Live" /></span>
          <div className="flex justify-end gap-1.5">
            <button onClick={() => onEdit(r)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-brand hover:text-brand" title="Edit"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => del(r)} disabled={busyId === r.id} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-red-400 hover:text-red-500 disabled:opacity-50" title="Delete">
              {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ))}
    </TableCard>
  );
}

function Badge({ n }: { n: number }) {
  return <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] font-bold text-charcoal">{n} total</span>;
}

/* ------------------------------ inbox (messages/quotes) ------------------------------ */
function Inbox({ kind, toast }: { kind: "messages" | "quotes"; toast: (m: string) => void }) {
  const [rows, setRows] = useState<(AdminMessage | AdminQuote)[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDynamic } = useContent();

  const load = async () => {
    setLoading(true);
    try {
      setRows((await api.list(kind)) as AdminMessage[]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isDynamic) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDynamic]);

  const setStatus = async (row: AdminMessage, status: string) => {
    try {
      await api.update(kind, row.id, { ...row, status });
      toast(`Marked ${status} ✓`);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Update failed");
    }
  };
  const del = async (row: AdminMessage) => {
    if (!window.confirm("Delete this entry permanently?")) return;
    try {
      await api.remove(kind, row.id);
      toast("Deleted ✓");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const isMsg = kind === "messages";
  const STATUSES = isMsg ? ["New", "In Progress", "Replied", "Accepted"] : ["Pending", "Quoted", "Accepted"];

  return (
    <TableCard
      title={isMsg ? "Contact Messages" : "Quote Requests"}
      sub={isMsg ? "Live inquiries from the contact form — stored in the database." : "Live leads from the Get-a-Quote system — stored in the database."}
      action="Refresh"
      onAction={load}
    >
      {loading && <p className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}
      {!loading && rows.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">No entries yet. Submissions from the website appear here instantly.</p>}
      {rows.map((r) => (
        <div key={r.id} className="gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex sm:items-center">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold text-white", isMsg ? "bg-brand-light !text-brand" : "bg-ink")}>
            {(r.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold">
              {isMsg ? (r as AdminMessage).message?.slice(0, 60) || "—" : `${r.name} · ${r.company || "—"}`}
              {!isMsg && null}
            </span>
            <span className="block truncate text-[12px] text-muted">
              {r.name} · {r.email} · {r.service || "—"}{r.budget ? ` · ${r.budget}` : ""} · {r.date}
            </span>
          </span>
          <span className="mt-2 flex items-center gap-2 sm:mt-0">
            <span className="text-[11.5px] text-muted">{r.date}</span>
            <select
              value={r.status}
              onChange={(e) => setStatus(r, e.target.value)}
              className="rounded-lg border border-line bg-white px-2 py-1.5 text-[11.5px] font-bold text-charcoal"
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <StatusPill s={r.status} />
            <button onClick={() => del(r)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted transition hover:border-red-400 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
          </span>
        </div>
      ))}
    </TableCard>
  );
}

/* ------------------------------ shared UI ------------------------------ */
function TableCard({ title, sub, action, onAction, children, right, disabled }: {
  title: string; sub: string; action: string; onAction?: () => void; children: React.ReactNode; right?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div><h2 className="font-display text-lg font-extrabold">{title}</h2><p className="text-[13px] text-muted">{sub}</p></div>
        <div className="flex items-center gap-2">
          {right}
          <button
            onClick={onAction}
            disabled={disabled}
            title={disabled ? "API offline — start the server (npm run server) to enable editing" : undefined}
            className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {action}
          </button>
        </div>
      </div>
      <div className="border-t border-line">{children}</div>
      <div className="flex items-center justify-between border-t border-line bg-paper/60 px-5 py-3 text-[12px] text-muted">
        <span>Stored in {disabled ? "bundled demo data" : "MySQL database"}</span>
        <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Live</span>
      </div>
    </div>
  );
}

/* ------------------------------ login screen ------------------------------ */
function LoginScreen({ onLogin }: { onLogin: (user: AdminUser, token: string) => void }) {
  const [email, setEmail] = useState("admin@codecraftsolutions.com");
  const [password, setPassword] = useState("password");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await apiLogin(email, password);
      persistToken(res.token);
      onLogin(res.user, res.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed — is the API server running? (npm run server)");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-paper px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-card sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink"><LayoutDashboard className="h-6 w-6 text-white" /></span>
        <h1 className="font-display mt-5 text-center text-2xl font-extrabold text-charcoal">Admin Panel</h1>
        <p className="mt-1.5 text-center text-sm text-muted">Sign in to manage website content from the database.</p>
        <form className="mt-7 space-y-4" onSubmit={submit}>
          <div><label className="mb-1.5 block text-[13px] font-semibold">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3 text-sm" /></div>
          <div><label className="mb-1.5 block text-[13px] font-semibold">Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-line px-4 py-3 text-sm" /></div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In to Dashboard
          </button>
        </form>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[12px] text-muted"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> Default login: admin@codecraftsolutions.com / password</p>
      </motion.div>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
type Tab = "dashboard" | "projects" | "services" | "tech" | "team" | "testimonials" | "blog" | "careers" | "messages" | "quotes" | "settings";

export default function Admin() {
  const content = useContent();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebar, setSidebar] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [editing, setEditing] = useState<{ key: EntityKey; row: Row } | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // restore session
  useEffect(() => {
    const t = getToken();
    if (!t) {
      setAuthReady(true);
      return;
    }
    fetchMe()
      .then((r) => setUser(r.user))
      .catch(() => persistToken(null))
      .finally(() => setAuthReady(true));
  }, []);

  const toast = (m: string) => {
    setToastMsg(m);
    window.setTimeout(() => setToastMsg(""), 2600);
  };

  const counts: Record<string, number> = {
    projects: content.projects.length,
    services: content.services.length,
    techCategories: content.techCategories.length,
    team: content.team.length,
    testimonials: content.testimonials.length,
    blogPosts: content.blogPosts.length,
    jobs: content.jobs.length,
  };

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderKanban, badge: counts.projects },
    { id: "services", label: "Services", icon: Briefcase, badge: counts.services },
    { id: "tech", label: "Technologies", icon: Wrench, badge: counts.techCategories },
    { id: "team", label: "Team", icon: Users, badge: counts.team },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare, badge: counts.testimonials },
    { id: "blog", label: "Blog", icon: PenLine, badge: counts.blogPosts },
    { id: "careers", label: "Careers", icon: FileText, badge: counts.jobs },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "quotes", label: "Quote Requests", icon: QuoteIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = useMemo(() => [
    { label: "Total Projects", value: counts.projects, icon: FolderKanban, delta: "live on website", color: "bg-brand" },
    { label: "Services", value: counts.services, icon: Briefcase, delta: "live on website", color: "bg-violet-500" },
    { label: "Team Members", value: counts.team, icon: Users, delta: "live on website", color: "bg-amber-500" },
    { label: "Blog Posts", value: counts.blogPosts, icon: PenLine, delta: "live on website", color: "bg-emerald-500" },
    { label: "Open Jobs", value: counts.jobs, icon: FileText, delta: "live on website", color: "bg-rose-500" },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [counts.projects, counts.services, counts.team, counts.blogPosts, counts.jobs]);

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-paper"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;
  }

  if (!user) {
    return <LoginScreen onLogin={(u) => { setUser(u); setTab("dashboard"); }} />;
  }

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed left-1/2 top-5 z-[95] -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-[13px] font-bold text-white shadow-2xl">
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* topbar */}
      <div className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <button onClick={() => setSidebar(!sidebar)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-line lg:hidden" aria-label="Menu">
            {sidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white font-mono text-[13px] font-bold">CC</span>
            <span className="hidden sm:block"><span className="font-display block text-[14px] font-extrabold leading-none">CodeCraft Admin</span><span className="mt-0.5 block text-[11px] text-muted">MySQL Content Management</span></span>
          </div>
          <span className={cn(
            "ml-3 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold md:flex",
            content.isDynamic ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          )}>
            <span className={cn("h-1.5 w-1.5 rounded-full", content.isDynamic ? "bg-emerald-500" : "bg-amber-500")} />
            {content.isDynamic ? "Database connected" : "API offline — read-only demo"}
          </span>
          <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2" />
            <input placeholder="Search…" className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-[13px]" />
          </div>
          <button className="relative ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-line md:ml-0" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5 h-5 w-5 text-charcoal" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-line py-1.5 pl-1.5 pr-3">
            {content.team[0]?.image
              ? <img src={content.team[0].image} alt="Admin" className="h-7 w-7 rounded-lg object-cover" />
              : <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-[10px] font-bold text-white">{user.name.slice(0, 1)}</span>}
            <span className="hidden text-left sm:block"><span className="block text-[12.5px] font-bold leading-none">{user.name}</span><span className="mt-0.5 block text-[10.5px] text-muted">{user.role}</span></span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
          <Link to="/" className="hidden h-10 items-center gap-1.5 rounded-xl border border-line px-4 text-[13px] font-semibold text-charcoal transition hover:border-brand hover:text-brand sm:flex">
            ← Website
          </Link>
          <button onClick={logout} className="hidden h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-[13px] font-semibold text-white transition hover:bg-red-600 sm:flex">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-0 px-0 sm:px-6 sm:py-6 lg:gap-6">
        {/* sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 -translate-x-full overflow-y-auto border-r border-line bg-white p-4 transition-transform lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:rounded-2xl lg:border",
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
            <p className="text-[13px] font-bold text-white">Everything is live</p>
            <p className="mt-1 text-[12px] text-slate-400">Add, edit or delete anything here — the website updates instantly.</p>
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
                      <h1 className="font-display text-2xl font-extrabold text-charcoal">Welcome back, {user.name} 👋</h1>
                      <p className="text-sm text-muted">Everything you change here goes live on the website instantly.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-semibold"><Filter className="h-4 w-4" /> Live data</button>
                      <button onClick={() => setTab("projects")} className="btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold"><Plus className="h-4 w-4" /> New Project</button>
                    </div>
                  </div>

                  {!content.isDynamic && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] font-semibold text-amber-700">
                      API server is not reachable — showing bundled demo data (read-only). Start it with <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run server</code> and refresh.
                    </div>
                  )}

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

                  <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
                      <div className="flex items-center justify-between">
                        <div><h3 className="font-display text-[16px] font-bold">Revenue Overview</h3><p className="text-[12px] text-muted">Demo analytics · 2026</p></div>
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
                      <h3 className="font-display text-[16px] font-bold">Content Overview</h3>
                      <p className="text-[12px] text-muted">Everything stored in MySQL right now</p>
                      <div className="mt-4 space-y-3.5">
                        {([
                          { l: "Projects", v: counts.projects, c: "bg-brand" },
                          { l: "Services", v: counts.services, c: "bg-emerald-500" },
                          { l: "Technology Categories", v: counts.techCategories, c: "bg-violet-500" },
                          { l: "Testimonials", v: counts.testimonials, c: "bg-amber-500" },
                        ] as const).map((r) => (
                          <div key={r.l}>
                            <div className="flex justify-between text-[12.5px] font-semibold"><span>{r.l}</span><span>{r.v}</span></div>
                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (r.v / 10) * 100)}%` }} transition={{ duration: 0.8 }} className={cn("h-full rounded-full", r.c)} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center gap-2 rounded-xl bg-paper p-4 text-[12.5px]">
                        <Layers className="h-4 w-4 shrink-0 text-brand" />
                        <p className="text-muted">All content is served to visitors from <span className="font-bold text-charcoal">GET /api/content</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(["projects", "services", "tech", "team", "testimonials", "blog"] as const).map((t) =>
                tab === t ? (
                  <EntityTable
                    key={t}
                    entityKey={TAB_TO_ENTITY[t]}
                    onEdit={(row) => setEditing({ key: TAB_TO_ENTITY[t], row })}
                    toast={toast}
                  />
                ) : null
              )}

              {tab === "careers" && (
                <EntityTable entityKey={TAB_TO_ENTITY.careers} onEdit={(row) => setEditing({ key: TAB_TO_ENTITY.careers, row })} toast={toast} />
              )}

              {tab === "messages" && <Inbox kind="messages" toast={toast} />}
              {tab === "quotes" && <Inbox kind="quotes" toast={toast} />}

              {tab === "settings" && (
                <div className="grid gap-5 lg:grid-cols-2">
                  {[
                    { t: "Database", d: "MySQL connection used by this panel.", rows: [["Engine", content.isDynamic ? "MySQL (live)" : "File store / offline"], ["API", "/api/content"], ["Tables", "12 content tables + admin_users"]] },
                    { t: "Admin Account", d: "Signed-in administrator.", rows: [["Name", user.name], ["Email", user.email], ["Role", user.role]] },
                    { t: "Security", d: "Auth configuration.", rows: [["Passwords", "bcrypt hashed"], ["Sessions", "JWT · 7 days"], ["Default password", "Change via ADMIN_PASSWORD env"]] },
                    { t: "Deployment", d: "How to run the full stack.", rows: [["API server", "npm run server (port 3001)"], ["Website", "npm run dev (port 5173)"], ["Production", "npm run build → single dist/index.html + API"]] },
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
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* edit / create modal */}
      <AnimatePresence>
        {editing && (
          <ItemFormModal
            entityKey={editing.key}
            initial={editing.row?.id ? editing.row : null}
            onClose={() => setEditing(null)}
            onSaved={toast}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
