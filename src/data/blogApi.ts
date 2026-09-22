import { blogPosts, type BlogPost } from "./content";

const API_URL = import.meta.env.VITE_API_URL || "/api";
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${API_URL}/blogs`);
    if (!response.ok) throw new Error("API unavailable");
    return await response.json() as BlogPost[];
  } catch {
    // The website remains usable during local development before MySQL is configured.
    return blogPosts;
  }
}
export async function createBlogPost(post: Omit<BlogPost, "slug"> & { slug: string }): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/blogs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(post) });
  if (!response.ok) throw new Error((await response.json()).error || "Could not create post");
  return response.json();
}
export async function deleteBlogPost(id: string | number) {
  const response = await fetch(`${API_URL}/blogs/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Could not delete post");
}

export async function getResource<T>(resource: string, fallback: T[] = []): Promise<T[]> {
  try {
    const response = await fetch(`${API_URL}/${resource}`);
    if (!response.ok) throw new Error("API unavailable");
    return await response.json() as T[];
  } catch { return fallback; }
}

export async function deleteResource(resource: string, id: string | number) {
  const response = await fetch(`${API_URL}/${resource}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Could not delete record");
}
export async function getSettings(): Promise<Record<string, string>> {
  const response = await fetch(`${API_URL}/settings`);
  if (!response.ok) throw new Error("Could not load settings");
  const rows = await response.json() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
export async function saveSetting(key: string, value: string) {
  const response = await fetch(`${API_URL}/settings/${encodeURIComponent(key)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }) });
  if (!response.ok) throw new Error("Could not save setting");
}
