import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { ensureProjectSchema } from "./projects-schema.js";
dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "25mb" }));
const db = mysql.createPool({ host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME || "codecraft" });
const port = Number(process.env.PORT || 8787);
const emailOk = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
app.get("/api/dashboard/recent", async (_req,res)=>{ try { const [messages] = await db.query("SELECT id,name,email,message,service,created_at AS createdAt FROM contact_messages ORDER BY id DESC LIMIT 5"); const [quotes] = await db.query("SELECT id,name,email,company,service,budget,details,created_at AS createdAt FROM quote_requests ORDER BY id DESC LIMIT 5"); res.json({ messages, quotes }); } catch { res.status(503).json({ error:"Could not load recent dashboard data" }); } });
app.get("/api/dashboard/summary", async (_req,res)=>{ try { const names=["projects","services","team_members","testimonials","blog_posts","jobs","contact_messages","quote_requests","job_applications"]; const result={}; for(const name of names){ const [rows]=await db.query("SELECT COUNT(*) AS total FROM `"+name+"`"); result[name]=Number(rows[0].total); } res.json(result); } catch { res.status(503).json({ error:"Could not load dashboard summary" }); } });
app.get("/api/health", async (_req,res) => { try { await db.query("SELECT 1"); res.json({ ok:true, database:"mysql" }); } catch { res.status(503).json({ ok:false, database:"unavailable" }); } });
/* ================= ADMIN AUTH (single administrator, credentials from .env) ================= */
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.ADMIN_SESSION_SECRET) console.warn("ADMIN_SESSION_SECRET is not set: admin sessions reset when the API restarts.");
const SESSION_MS = 8 * 60 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const loginFailures = new Map();
const signToken = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
};
const verifyToken = (token) => {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return payload.role === "admin" && payload.exp > Date.now() ? payload : null;
  } catch { return null; }
};
const safeEqual = (a, b) => crypto.timingSafeEqual(crypto.createHash("sha256").update(String(a)).digest(), crypto.createHash("sha256").update(String(b)).digest());
const requireAdmin = (req, res, next) => {
  const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
  const session = match ? verifyToken(match[1]) : null;
  if (!session) return res.status(401).json({ error: "Admin sign-in required" });
  req.admin = session;
  next();
};
app.post("/api/auth/login", (req, res) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return res.status(503).json({ error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in server .env" });
  const now = Date.now();
  const record = loginFailures.get(req.ip) || { count: 0, lockedUntil: 0 };
  if (record.lockedUntil > now) return res.status(429).json({ error: "Too many failed sign-in attempts. Try again in 15 minutes." });
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (email === ADMIN_EMAIL && safeEqual(password, ADMIN_PASSWORD)) {
    loginFailures.delete(req.ip);
    const exp = now + SESSION_MS;
    return res.json({ token: signToken({ role: "admin", sub: email, exp }), expiresAt: new Date(exp).toISOString(), email });
  }
  record.count += 1;
  if (record.count >= LOGIN_MAX_FAILURES) { record.count = 0; record.lockedUntil = now + LOGIN_LOCK_MS; }
  loginFailures.set(req.ip, record);
  res.status(401).json({ error: "Invalid email or password" });
});

/* ================= PROJECTS (MySQL is the single source of truth) ================= */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_MAX_BYTES = 3 * 1024 * 1024;
const GALLERY_MAX = 8;
const IMAGE_MAGIC = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/gif": (b) => b.subarray(0, 4).toString("ascii") === "GIF8",
  "image/webp": (b) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
};
const ADMIN_LIST_COLUMNS = "id,name,slug,category,client,year,duration,description,image,technologies,results,published,featured,visible,display_order,live_url,github_url,created_at,updated_at";
const isHttpUrl = (value, max = 500) => {
  if (!value || value.length > max) return false;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
};
const isGithubUrl = (value) => isHttpUrl(value) && /(^|\.)github\.com$/i.test(new URL(value).hostname);
// Returns an error message, or null when the value is a valid image (uploaded data URL or http(s) URL).
function checkImage(value, label) {
  const v = String(value).trim();
  if (v.startsWith("data:")) {
    if (v.length > IMAGE_MAX_BYTES * 1.4 + 100) return `${label} must be 3 MB or smaller`;
    const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(v);
    if (!match) return `${label} must be a JPG, PNG, WEBP or GIF image`;
    const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
    if (buffer.length > IMAGE_MAX_BYTES) return `${label} must be 3 MB or smaller`;
    if (!IMAGE_MAGIC[match[1]](buffer)) return `${label} file content does not match its type`;
    return null;
  }
  return isHttpUrl(v, 2000) ? null : `${label} must be an http(s) URL or an uploaded JPG, PNG, WEBP or GIF`;
}
const toBool = (value) => {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true" || value === "on") return true;
  if (value === 0 || value === "0" || value === "false" || value === "off") return false;
  return undefined;
};
function parseTechnologies(value) {
  const list = Array.isArray(value) ? value : String(value).split(",");
  return list.map((item) => String(item).trim()).filter(Boolean);
}
// Accepts "value | label" lines (admin form) or an array of { value, label } objects.
function parseResults(value) {
  if (Array.isArray(value)) return value.map((item) => ({ value: String(item?.value ?? "").trim(), label: String(item?.label ?? "").trim() }));
  return String(value).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [v, ...rest] = line.split("|");
    return { value: v.trim(), label: rest.join("|").trim() };
  });
}
// Validates the submitted fields. Create requires every required field; update validates only the fields that were sent.
function validateProject(body, create) {
  const src = body && typeof body === "object" ? body : {};
  const errors = [];
  const data = {};
  const has = (key) => src[key] !== undefined;
  const text = (key, label, max, required) => {
    if (!has(key)) { if (create && required) errors.push(`${label} is required`); return; }
    const v = String(src[key] ?? "").trim();
    if (!v) { if (required) errors.push(`${label} is required`); else data[key] = null; return; }
    if (v.length > max) { errors.push(`${label} must be ${max} characters or fewer`); return; }
    data[key] = v;
  };
  text("name", "Project name", 255, true);
  text("category", "Category", 80, true);
  text("client", "Client", 180, true);
  text("duration", "Duration", 80, true);
  text("description", "Short description", 500, true);
  text("long_description", "Full description", 20000, false);
  if (has("slug") || create) {
    const slug = String(src.slug ?? "").trim().toLowerCase();
    if (!slug) errors.push("Slug is required");
    else if (slug.length > 180 || !SLUG_RE.test(slug)) errors.push("Slug may only contain lowercase letters, numbers and single hyphens");
    else data.slug = slug;
  }
  if (has("year") || create) {
    const year = String(src.year ?? "").trim();
    if (!/^\d{4}$/.test(year)) errors.push("Year must be a four-digit number");
    else data.year = year;
  }
  if (has("image") || create) {
    const image = String(src.image ?? "").trim();
    if (!image) errors.push("Thumbnail image is required");
    else { const err = checkImage(image, "Thumbnail"); if (err) errors.push(err); else data.image = image; }
  }
  if (has("gallery")) {
    const list = Array.isArray(src.gallery) ? src.gallery : [];
    if (list.length > GALLERY_MAX) errors.push(`Gallery can contain at most ${GALLERY_MAX} images`);
    else {
      const items = list.map((item) => String(item ?? "").trim()).filter(Boolean);
      const bad = items.map((item) => checkImage(item, "Gallery image")).find(Boolean);
      if (bad) errors.push(bad); else data.gallery = JSON.stringify(items);
    }
  }
  if (has("technologies")) {
    const list = parseTechnologies(src.technologies ?? []);
    if (list.length > 20 || list.some((item) => item.length > 40)) errors.push("Technologies: up to 20 items, each 40 characters or fewer");
    else data.technologies = JSON.stringify(list);
  }
  if (has("results")) {
    const list = parseResults(src.results ?? "");
    if (list.length > 6) errors.push("Results: up to 6 entries");
    else if (list.some((item) => !item.value || !item.label)) errors.push("Each result must be written as \"value | label\"");
    else if (list.some((item) => item.value.length > 40 || item.label.length > 80)) errors.push("Result value must be 40 characters or fewer and label 80 or fewer");
    else data.results = JSON.stringify(list);
  }
  for (const [key, label] of [["published", "Status"], ["featured", "Featured"], ["visible", "Visibility"]]) {
    if (!has(key)) continue;
    const flag = toBool(src[key]);
    if (flag === undefined) errors.push(`${label} must be true or false`);
    else data[key] = flag ? 1 : 0;
  }
  if (has("display_order")) {
    const order = Number(src.display_order === "" ? 0 : src.display_order);
    if (!Number.isInteger(order) || order < 0 || order > 100000) errors.push("Display order must be a whole number from 0 to 100000");
    else data.display_order = order;
  }
  for (const [key, label] of [["live_url", "Live website URL"], ["github_url", "GitHub repository URL"]]) {
    if (!has(key)) continue;
    const v = String(src[key] ?? "").trim();
    if (!v) data[key] = null;
    else if (key === "github_url" ? !isGithubUrl(v) : !isHttpUrl(v)) errors.push(key === "github_url" ? "GitHub repository URL must be a github.com link" : `${label} must be a valid http(s) URL`);
    else data[key] = v;
  }
  if (create) {
    data.published = data.published ?? 0;
    data.visible = data.visible ?? 1;
    data.featured = data.featured ?? 0;
  }
  return { data, errors };
}
const parseJsonColumn = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") { try { return JSON.parse(value); } catch { return fallback; } }
  return value;
};
const adminProject = (row) => ({
  ...row,
  technologies: parseJsonColumn(row.technologies, []),
  results: parseJsonColumn(row.results, []),
  gallery: parseJsonColumn(row.gallery, []),
  published: !!row.published,
  featured: !!row.featured,
  visible: !!row.visible,
  status: row.published ? "Published" : "Draft",
});
// Shape used by the public Portfolio and Home pages (matches the Project type in src/data/content.ts).
const publicProject = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  category: row.category,
  description: row.description,
  longDescription: row.long_description || row.description,
  image: row.image,
  gallery: parseJsonColumn(row.gallery, []),
  technologies: parseJsonColumn(row.technologies, []),
  results: parseJsonColumn(row.results, []),
  year: row.year,
  client: row.client,
  duration: row.duration,
  liveUrl: row.live_url || null,
  githubUrl: row.github_url || null,
  featured: !!row.featured,
  displayOrder: row.display_order,
});
const DB_CONNECTION_CODES = ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EHOSTUNREACH", "PROTOCOL_CONNECTION_LOST", "ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "PROTOCOL_SEQUENCE_TIMEOUT"];
function dbError(res, error, message) {
  console.error(message, error.code || "", error.sqlMessage || error.message);
  if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "A project with this slug already exists", field: "slug" });
  if (DB_CONNECTION_CODES.includes(error.code)) return res.status(503).json({ error: "Database is unavailable. Check MySQL and server .env settings." });
  return res.status(500).json({ error: message });
}
const isId = (value) => /^\d{1,10}$/.test(String(value));
const idErrorOrNull = (res, id) => (isId(id) ? null : res.status(404).json({ error: "Project not found" }));

// Public routes: published AND visible projects only. Drafts and hidden projects are never returned here.
app.get("/api/public/projects", async (req, res) => {
  try {
    const where = ["published = 1", "visible = 1"];
    const params = [];
    const q = String(req.query.q || "").trim().slice(0, 100);
    if (q) { where.push("(name LIKE ? OR category LIKE ? OR client LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    const category = String(req.query.category || "").trim();
    if (category) { where.push("category = ?"); params.push(category); }
    const [rows] = await db.query(`SELECT * FROM projects WHERE ${where.join(" AND ")} ORDER BY featured DESC, display_order ASC, id DESC`, params);
    res.json(rows.map(publicProject));
  } catch (error) { dbError(res, error, "Could not load projects"); }
});
app.get("/api/public/projects/:slug", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM projects WHERE slug = ? AND published = 1 AND visible = 1 LIMIT 1", [String(req.params.slug)]);
    if (!rows.length) return res.status(404).json({ error: "Project not found" });
    res.json(publicProject(rows[0]));
  } catch (error) { dbError(res, error, "Could not load project"); }
});

// Admin routes: sign-in required.
app.get("/api/projects", requireAdmin, async (req, res) => {
  try {
    const where = ["1 = 1"];
    const params = [];
    const q = String(req.query.q || "").trim().slice(0, 100);
    if (q) { where.push("(name LIKE ? OR slug LIKE ? OR category LIKE ? OR client LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
    const category = String(req.query.category || "").trim();
    if (category) { where.push("category = ?"); params.push(category); }
    const status = String(req.query.status || "");
    if (status === "published") where.push("published = 1");
    if (status === "draft") where.push("published = 0");
    if (status === "hidden") where.push("visible = 0");
    if (req.query.featured === "1" || req.query.featured === "true") where.push("featured = 1");
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const whereSql = where.join(" AND ");
    const [[countRow]] = await db.query(`SELECT COUNT(*) AS total FROM projects WHERE ${whereSql}`, params);
    const [rows] = await db.query(`SELECT ${ADMIN_LIST_COLUMNS} FROM projects WHERE ${whereSql} ORDER BY display_order ASC, id DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]);
    const [[counts]] = await db.query("SELECT COUNT(*) AS total, COALESCE(SUM(published = 1), 0) AS published, COALESCE(SUM(published = 0), 0) AS draft, COALESCE(SUM(visible = 0), 0) AS hidden, COALESCE(SUM(featured = 1), 0) AS featured FROM projects");
    const [categoryRows] = await db.query("SELECT DISTINCT category FROM projects ORDER BY category");
    const total = Number(countRow.total);
    res.json({
      items: rows.map(adminProject),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      counts: { total: Number(counts.total), published: Number(counts.published), draft: Number(counts.draft), hidden: Number(counts.hidden), featured: Number(counts.featured) },
      categories: categoryRows.map((row) => row.category),
    });
  } catch (error) { dbError(res, error, "Could not load projects"); }
});
app.get("/api/projects/:id", requireAdmin, async (req, res) => {
  if (idErrorOrNull(res, req.params.id)) return;
  try {
    const [rows] = await db.query("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Project not found" });
    res.json(adminProject(rows[0]));
  } catch (error) { dbError(res, error, "Could not load project"); }
});
app.post("/api/projects", requireAdmin, async (req, res) => {
  const { data, errors } = validateProject(req.body, true);
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  try {
    const [[duplicate]] = await db.query("SELECT id FROM projects WHERE slug = ? LIMIT 1", [data.slug]);
    if (duplicate) return res.status(409).json({ error: "A project with this slug already exists", field: "slug" });
    if (data.display_order === undefined) {
      const [[next]] = await db.query("SELECT COALESCE(MAX(display_order), 0) + 1 AS next FROM projects");
      data.display_order = Number(next.next);
    }
    const keys = Object.keys(data);
    const [result] = await db.execute(`INSERT INTO projects (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`, keys.map((k) => data[k]));
    const [rows] = await db.query("SELECT * FROM projects WHERE id = ?", [result.insertId]);
    res.status(201).json(adminProject(rows[0]));
  } catch (error) { dbError(res, error, "Could not create project"); }
});
app.put("/api/projects/:id", requireAdmin, async (req, res) => {
  if (idErrorOrNull(res, req.params.id)) return;
  const { data, errors } = validateProject(req.body, false);
  if (errors.length) return res.status(400).json({ error: errors[0], errors });
  const keys = Object.keys(data);
  if (!keys.length) return res.status(400).json({ error: "No project fields were submitted" });
  try {
    const [[existing]] = await db.query("SELECT id FROM projects WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Project not found" });
    if (data.slug) {
      const [[duplicate]] = await db.query("SELECT id FROM projects WHERE slug = ? AND id <> ? LIMIT 1", [data.slug, req.params.id]);
      if (duplicate) return res.status(409).json({ error: "A project with this slug already exists", field: "slug" });
    }
    await db.execute(`UPDATE projects SET ${keys.map((k) => `\`${k}\` = ?`).join(", ")} WHERE id = ?`, [...keys.map((k) => data[k]), req.params.id]);
    const [rows] = await db.query("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    res.json(adminProject(rows[0]));
  } catch (error) { dbError(res, error, "Could not update project"); }
});
app.delete("/api/projects/:id", requireAdmin, async (req, res) => {
  if (idErrorOrNull(res, req.params.id)) return;
  try {
    // Images are stored inside the project row (or are external URLs), so deleting the row removes everything this project owns.
    const [result] = await db.execute("DELETE FROM projects WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Project not found" });
    res.status(204).end();
  } catch (error) { dbError(res, error, "Could not delete project"); }
});
app.get("/api/messages", async (_req,res)=>{try{const [rows]=await db.query("SELECT * FROM contact_messages ORDER BY id DESC");res.json(rows);}catch{res.status(503).json({error:"Could not load messages"});}});
app.get("/api/quotes", async (_req,res)=>{try{const [rows]=await db.query("SELECT * FROM quote_requests ORDER BY id DESC");res.json(rows);}catch{res.status(503).json({error:"Could not load quotes"});}});
app.post("/api/messages",async(req,res)=>{const{name,email,message,service}=req.body;if(!name||!emailOk(email)||!message)return res.status(400).json({error:"Name, valid email and message are required"});try{const[r]=await db.execute("INSERT INTO contact_messages (name,email,message,service) VALUES (?,?,?,?)",[name,email,message,service||null]);res.status(201).json({id:r.insertId});}catch{res.status(400).json({error:"Could not save message"});}});
app.post("/api/quotes",async(req,res)=>{const{name,email,company,service,budget,details}=req.body;if(!name||!emailOk(email)||!service)return res.status(400).json({error:"Name, valid email and service are required"});try{const[r]=await db.execute("INSERT INTO quote_requests (name,email,company,service,budget,details) VALUES (?,?,?,?,?,?)",[name,email,company||null,service,budget||null,details||null]);res.status(201).json({id:r.insertId});}catch{res.status(400).json({error:"Could not save quote request"});}});
app.post("/api/applications",async(req,res)=>{const{name,email,jobTitle,resumeUrl,message}=req.body;if(!name||!emailOk(email))return res.status(400).json({error:"Name and valid email are required"});try{const[r]=await db.execute("INSERT INTO job_applications (name,email,job_title,resume_url,message) VALUES (?,?,?,?,?)",[name,email,jobTitle||null,resumeUrl||null,message||null]);res.status(201).json({id:r.insertId});}catch{res.status(400).json({error:"Could not save application"});}});
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
  if (error.type === "entity.too.large") return res.status(413).json({ error: "Request is too large. Use smaller images." });
  console.error("Unhandled API error:", error.message);
  res.status(500).json({ error: "Unexpected server error" });
});
ensureProjectSchema(db).then((added) => console.log(added.length ? `Projects table updated: added ${added.join(", ")}` : "Projects table schema is up to date")).catch((error) => console.error("Projects schema check failed:", error.code || "", error.message));
app.listen(port,"0.0.0.0",()=>console.log(`CodeCraft API listening on ${port}`));
