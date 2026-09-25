import { useEffect, useState } from "react";

type Admin = { id: number; name: string; email: string; role: string; isActive: boolean; lastLogin?: string };

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [permissionAdmin, setPermissionAdmin] = useState<Admin | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const permissionList = ["projects", "services", "team", "blog", "messages", "quotes", "careers"];
  const openPermissions = async (admin: Admin) => { const response = await fetch(`/api/admins/${admin.id}/permissions`); setPermissions(response.ok ? await response.json() : []); setPermissionAdmin(admin); };
  const savePermissions = async () => { if (!permissionAdmin) return; await fetch(`/api/admins/${permissionAdmin.id}/permissions`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ permissions }) }); setPermissionAdmin(null); };

  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admins");
      if (!response.ok) throw new Error();
      setAdmins(await response.json());
    } catch { setError("Admins load nahi ho sake. API aur database check karein."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadAdmins(); fetch("/api/activity-logs").then((r) => r.ok ? r.json() : []).then(setLogs); }, []);

  const updateAdmin = async (admin: Admin, changes: Partial<Admin>) => {
    const response = await fetch(`/api/admins/${admin.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes),
    });
    if (response.ok) await loadAdmins(); else setError("Admin update nahi ho saka.");
  };

  const deleteAdmin = async (admin: Admin) => {
    if (!window.confirm(`${admin.name} ko delete karna hai?`)) return;
    const response = await fetch(`/api/admins/${admin.id}`, { method: "DELETE" });
    if (response.ok) await loadAdmins(); else setError("Admin delete nahi ho saka.");
  };

  return <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
    <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Manage Admins</h2><p className="text-sm text-muted">Super Admin access only</p></div><button onClick={() => setShowAdd(true)} className="btn-primary rounded-xl px-4 py-2 text-sm">Add Admin</button></div>
    {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    {showAdd && <form className="mt-4 grid gap-3 rounded-xl border border-line bg-paper p-4 sm:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (response.ok) { setShowAdd(false); await loadAdmins(); } else setError("Admin create nahi ho saka."); }}><input name="name" required placeholder="Name" className="rounded-lg border border-line px-3 py-2" /><input name="email" required type="email" placeholder="Email" className="rounded-lg border border-line px-3 py-2" /><input name="password" required minLength={8} type="password" placeholder="Password" className="rounded-lg border border-line px-3 py-2" /><select name="role" className="rounded-lg border border-line px-3 py-2"><option>Editor</option><option>Viewer</option><option>Super Admin</option></select><div className="flex gap-2 sm:col-span-2"><button className="btn-primary rounded-lg px-4 py-2 text-sm">Create Admin</button><button type="button" onClick={() => setShowAdd(false)} className="rounded-lg border border-line px-4 py-2 text-sm">Cancel</button></div></form>}
    {loading ? <p className="mt-5 text-sm text-muted">Loading admins...</p> : <div className="mt-5 space-y-3">{admins.map((admin) => <div key={admin.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{admin.name}</p><p className="text-xs text-muted">{admin.email} · {admin.role}</p></div><span className={admin.isActive ? "text-xs font-bold text-emerald-600" : "text-xs font-bold text-red-600"}>{admin.isActive ? "Active" : "Inactive"}</span><button onClick={() => updateAdmin(admin, { isActive: !admin.isActive })} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">{admin.isActive ? "Deactivate" : "Activate"}</button><button onClick={() => openPermissions(admin)} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">Permissions</button><button onClick={() => deleteAdmin(admin)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">Delete</button></div>)}</div>}
  </section>;
}
