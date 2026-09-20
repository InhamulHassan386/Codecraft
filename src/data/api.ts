/* Tiny API client for the CodeCraft CMS backend (server/) */

const BASE = "/api";
const TOKEN_KEY = "cc_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.headers) Object.assign(headers, options.headers);
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- public ---------- */
export function fetchContent(): Promise<Record<string, unknown[]>> {
  return request("/content");
}
export function submitMessage(payload: Record<string, string>) {
  return request("/messages", { method: "POST", body: JSON.stringify(payload) });
}
export function submitQuote(payload: Record<string, string>) {
  return request("/quotes", { method: "POST", body: JSON.stringify(payload) });
}

/* ---------- auth ---------- */
export function login(email: string, password: string) {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}
export function fetchMe() {
  return request("/auth/me");
}

/* ---------- admin CRUD ---------- */
export const api = {
  list: (entity: string) => request(`/${entity}`),
  create: (entity: string, item: Record<string, unknown>) =>
    request(`/${entity}`, { method: "POST", body: JSON.stringify(item) }),
  update: (entity: string, id: string | number, item: Record<string, unknown>) =>
    request(`/${entity}/${id}`, { method: "PUT", body: JSON.stringify(item) }),
  remove: (entity: string, id: string | number) =>
    request(`/${entity}/${id}`, { method: "DELETE" }),
};
