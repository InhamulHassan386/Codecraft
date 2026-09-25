import { useEffect, useState } from "react";

type Admin = { id: number; name: string; email: string; role: string; isActive: boolean; lastLogin?: string };

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAdmins = async () => {
    try {
      const response = await fetch("/api/admins");
      if (!response.ok) throw new Error();
      setAdmins(await response.json());
    } catch { setError("Admins load nahi ho sake. API aur database check karein."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void loadAdmins(); }, []);

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
    <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Manage Admins</h2><p className="text-sm text-muted">Super Admin access only</p></div><button className="btn-primary rounded-xl px-4 py-2 text-sm">Add Admin</button></div>
    {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    {loading ? <p className="mt-5 text-sm text-muted">Loading admins...</p> : <div className="mt-5 space-y-3">{admins.map((admin) => <div key={admin.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{admin.name}</p><p className="text-xs text-muted">{admin.email} · {admin.role}</p></div><span className={admin.isActive ? "text-xs font-bold text-emerald-600" : "text-xs font-bold text-red-600"}>{admin.isActive ? "Active" : "Inactive"}</span><button onClick={() => updateAdmin(admin, { isActive: !admin.isActive })} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">{admin.isActive ? "Deactivate" : "Activate"}</button><button onClick={() => deleteAdmin(admin)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">Delete</button></div>)}</div>}
  </section>;
}
