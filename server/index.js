import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
const port = Number(process.env.PORT || 8787);
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "codecraft",
  waitForConnections: true,
  connectionLimit: 10,
});

const fields = "id, slug, title, excerpt, category, date, read_time AS readTime, image, author, author_role AS authorRole, featured";
app.get("/api/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ ok: true, database: "mysql" }); }
  catch { res.status(503).json({ ok: false, database: "unavailable" }); }
});
app.get("/api/blogs", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${fields} FROM blog_posts WHERE published = 1 ORDER BY featured DESC, published_at DESC, id DESC`);
    res.json(rows);
  } catch (error) { res.status(503).json({ error: "Blog database unavailable" }); }
});
app.post("/api/blogs", async (req, res) => {
  const { slug, title, excerpt, category, date, readTime, image, author, authorRole, featured = false } = req.body;
  if (!slug || !title || !excerpt || !category || !date || !readTime || !image || !author || !authorRole) return res.status(400).json({ error: "All blog fields are required" });
  try {
    const [result] = await pool.execute("INSERT INTO blog_posts (slug,title,excerpt,category,date,read_time,image,author,author_role,featured,published) VALUES (?,?,?,?,?,?,?,?,?,?,1)", [slug,title,excerpt,category,date,readTime,image,author,authorRole,featured ? 1 : 0]);
    const [rows] = await pool.query(`SELECT ${fields} FROM blog_posts WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) { res.status(400).json({ error: error.code === "ER_DUP_ENTRY" ? "Slug already exists" : "Could not create post" }); }
});
app.delete("/api/blogs/:id", async (req, res) => {
  try { const [result] = await pool.execute("DELETE FROM blog_posts WHERE id = ?", [req.params.id]); if (!result.affectedRows) return res.status(404).json({ error: "Post not found" }); res.status(204).end(); }
  catch { res.status(400).json({ error: "Could not delete post" }); }
});
const resources = {
  projects: { table: "projects", id: "id" },
  services: { table: "services", id: "id" },
  team: { table: "team_members", id: "id" },
  testimonials: { table: "testimonials", id: "id" },
  jobs: { table: "jobs", id: "id" },
  messages: { table: "contact_messages", id: "id" },
  quotes: { table: "quote_requests", id: "id" },
  applications: { table: "job_applications", id: "id" },
};
app.get("/api/:resource", async (req, res, next) => {
  const resource = resources[req.params.resource];
  if (!resource || req.params.resource === "blogs") return next();
  try { const [rows] = await pool.query(`SELECT * FROM ${resource.table} ORDER BY id DESC`); res.json(rows); }
  catch { res.status(503).json({ error: `Could not load ${req.params.resource}` }); }
});
app.post("/api/:resource", async (req, res, next) => {
  const resource = resources[req.params.resource];
  if (!resource) return next();
  const jsonColumns = new Set(["technologies", "results", "services", "assigned_team", "project_files", "features", "benefits", "deliverables", "skills", "responsibilities"]);
  const data = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => key !== "id" && value !== undefined).map(([key, value]) => [key, jsonColumns.has(key) && typeof value !== "string" ? JSON.stringify(value) : value]));
  if (!Object.keys(data).length) return res.status(400).json({ error: "Request body is empty" });
  try {
    const columns = Object.keys(data); const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO ${resource.table} (${columns.map((c) => `\`${c}\``).join(",")}) VALUES (${columns.map(() => "?").join(",")})`, values);
    const [rows] = await pool.query(`SELECT * FROM ${resource.table} WHERE id = ?`, [result.insertId]); res.status(201).json(rows[0]);
  } catch (error) { console.error("Create record:", error); res.status(400).json({ error: error.code === "ER_DUP_ENTRY" ? "Record already exists" : `Could not create record: ${error.message}` }); }
});
app.put("/api/:resource/:id", async (req, res, next) => {
  const resource = resources[req.params.resource];
  if (!resource) return next();
  const jsonColumns = new Set(["technologies", "results", "services", "assigned_team", "project_files", "features", "benefits", "deliverables", "skills", "responsibilities"]);
  const data = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => key !== "id" && value !== undefined).map(([key, value]) => [key, jsonColumns.has(key) && typeof value !== "string" ? JSON.stringify(value) : value]));
  try {
    const columns = Object.keys(data); await pool.execute(`UPDATE ${resource.table} SET ${columns.map((c) => `\`${c}\` = ?`).join(", ")} WHERE id = ?`, [...Object.values(data), req.params.id]);
    const [rows] = await pool.query(`SELECT * FROM ${resource.table} WHERE id = ?`, [req.params.id]); res.json(rows[0]);
  } catch { res.status(400).json({ error: "Could not update record" }); }
});
app.delete("/api/:resource/:id", async (req, res, next) => {
  const resource = resources[req.params.resource];
  if (!resource) return next();
  try { const [result] = await pool.execute(`DELETE FROM ${resource.table} WHERE id = ?`, [req.params.id]); if (!result.affectedRows) return res.status(404).json({ error: "Record not found" }); res.status(204).end(); }
  catch { res.status(400).json({ error: "Could not delete record" }); }
});
app.get("/api/settings", async (_req, res) => {
  try { const [rows] = await pool.query("SELECT setting_key AS `key`, setting_value AS value FROM site_settings ORDER BY setting_key"); res.json(rows); }
  catch { res.status(503).json({ error: "Could not load settings" }); }
});
app.put("/api/settings/:key", async (req, res) => {
  if (typeof req.body.value !== "string") return res.status(400).json({ error: "Setting value must be a string" });
  try { await pool.execute("INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [req.params.key, req.body.value]); res.json({ key: req.params.key, value: req.body.value }); }
  catch { res.status(400).json({ error: "Could not save setting" }); }
});
async function ensureProjectColumns() {
  const columns = [
    ["services", "JSON NULL"], ["current_status", "VARCHAR(60) NOT NULL DEFAULT 'Planning'"], ["progress", "TINYINT UNSIGNED NOT NULL DEFAULT 0"],
    ["start_date", "DATE NULL"], ["expected_completion", "DATE NULL"], ["assigned_team", "JSON NULL"], ["project_files", "JSON NULL"],
  ];
  for (const [name, definition] of columns) {
    try { await pool.query(`ALTER TABLE projects ADD COLUMN ${name} ${definition}`); }
    catch (error) { if (error.code !== "ER_DUP_FIELDNAME") console.warn(`projects.${name}:`, error.message); }
  }
}
ensureProjectColumns().finally(() => app.listen(port, "0.0.0.0", () => console.log(`CodeCraft API listening on ${port}`)));
