/* ----------------------------------------------------------------------------
   CodeCraft CMS — API server (Express + MySQL / file-store fallback)

   npm run server          → starts on http://localhost:3001
   Configuration in server/.env (copy from server/.env.example)

   Endpoints
   ────────────────────────────────────────────────────────────────────────────
   GET  /api/health              → { ok, mode: "mysql" | "file" }
   POST /api/auth/login          → { email, password }            → { token, user }
   GET  /api/auth/me             → current admin (auth)
   GET  /api/content             → all website content (public)
   POST /api/messages            → contact form (public)
   POST /api/quotes              → quote request form (public)
   GET  /api/messages            → list (auth)
   GET  /api/quotes              → list (auth)
   POST   /api/:entity           → create (auth)
   PUT    /api/:entity/:id       → update (auth)
   DELETE /api/:entity/:id       → delete (auth)
   ────────────────────────────────────────────────────────────────────────────
------------------------------------------------------------------------------ */
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import { initDb, dbMode, allContent, list, get, insert, update, remove, ENTITIES, findAdminByEmail } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "codecraft-dev-secret-change-me";

await initDb();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

/* ------------------------------ helpers ------------------------------ */
const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const slugify = (s) =>
  String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `item-${Date.now()}`;

function sign(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not signed in" });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Session expired — please sign in again" });
  }
}

const stripPrivate = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

/* ------------------------------ health ------------------------------ */
app.get("/api/health", (_req, res) => res.json({ ok: true, mode: dbMode() }));

/* ------------------------------ auth ------------------------------ */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await findAdminByEmail(email);
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ token: sign(user), user: stripPrivate(user) });
  } catch (e) {
    res.status(500).json({ error: "Login failed", detail: String(e.message || e) });
  }
});

app.get("/api/auth/me", auth, (req, res) => res.json({ user: req.admin }));

/* ------------------------------ public content ------------------------------ */
app.get("/api/content", async (_req, res) => {
  try {
    res.json(await allContent());
  } catch (e) {
    res.status(500).json({ error: "Failed to load content", detail: String(e.message || e) });
  }
});

/* ------------------------ public form submissions ------------------------ */
app.post("/api/messages", async (req, res) => {
  try {
    const b = req.body || {};
    const row = await insert("messages", {
      name: b.name || "", email: b.email || "", phone: b.phone || "", company: b.company || "",
      service: b.service || "", budget: b.budget || "", message: b.message || "",
      date: today(), status: "New",
    });
    res.status(201).json({ ok: true, id: row.id });
  } catch (e) {
    res.status(500).json({ error: "Could not save message", detail: String(e.message || e) });
  }
});

app.post("/api/quotes", async (req, res) => {
  try {
    const b = req.body || {};
    const row = await insert("quotes", {
      name: b.name || "", email: b.email || "", phone: b.phone || "", company: b.company || "",
      projectType: b.projectType || "", service: b.service || "", budget: b.budget || "",
      deadline: b.deadline || "", details: b.details || "",
      date: today(), status: "Pending",
    });
    res.status(201).json({ ok: true, id: row.id });
  } catch (e) {
    res.status(500).json({ error: "Could not save quote request", detail: String(e.message || e) });
  }
});

/* ------------------------------ admin CRUD ------------------------------ */
const ENTITY_META = {
  services: { slugFrom: "title" },
  projects: { slugFrom: "name" },
  techCategories: {},
  team: {},
  testimonials: {},
  blogPosts: { slugFrom: "title" },
  jobs: { slugFrom: "title" },
  processSteps: {},
  whyChooseUs: {},
  navLinks: {},
  messages: {},
  quotes: {},
};

app.get("/api/:entity", auth, async (req, res) => {
  const { entity } = req.params;
  if (!ENTITIES.includes(entity)) return res.status(404).json({ error: "Unknown collection" });
  res.json(await list(entity));
});

app.post("/api/:entity", auth, async (req, res) => {
  const { entity } = req.params;
  const meta = ENTITY_META[entity];
  if (!meta) return res.status(404).json({ error: "Unknown collection" });
  const body = { ...(req.body || {}) };
  if (meta.slugFrom && !body.slug) body.slug = slugify(body[meta.slugFrom] || body.title || body.name);
  const row = await insert(entity, body);
  res.status(201).json(row);
});

app.put("/api/:entity/:id", auth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ENTITY_META[entity]) return res.status(404).json({ error: "Unknown collection" });
  const body = { ...(req.body || {}) };
  delete body.id; // id is the table PK, never part of the JSON payload
  const row = await update(entity, id, body);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

app.delete("/api/:entity/:id", auth, async (req, res) => {
  const { entity, id } = req.params;
  if (!ENTITY_META[entity]) return res.status(404).json({ error: "Unknown collection" });
  const ok = await remove(entity, id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

/* ------------------------ serve built frontend ------------------------ */
const DIST = path.join(__dirname, "..", "dist");
if (fs.existsSync(path.join(DIST, "index.html"))) {
  app.use(express.static(DIST));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(DIST, "index.html")));
  console.log("[static] serving built site from dist/ (single command production mode)");
}

app.use((err, _req, res, _next) => {
  console.error("[server error]", err);
  res.status(500).json({ error: "Server error", detail: String(err.message || err) });
});

app.listen(PORT, () => {
  console.log(`[api] CodeCraft CMS API running → http://localhost:${PORT}  (mode: ${dbMode()})`);
});
