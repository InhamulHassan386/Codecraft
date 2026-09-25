import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
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

const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production";
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role = "Editor" } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: "Name, email and an 8+ character password are required" });
  try {
    const [count] = await pool.query("SELECT COUNT(*) AS total FROM admin_users");
    if (count[0].total > 0 && req.headers["x-super-admin"] !== process.env.SUPER_ADMIN_KEY) return res.status(403).json({ error: "Only a Super Admin can add admins" });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute("INSERT INTO admin_users (name,email,password_hash,role) VALUES (?,?,?,?)", [name, email, hash, role]);
    res.status(201).json({ id: result.insertId, name, email, role });
  } catch (error) { res.status(400).json({ error: error.code === "ER_DUP_ENTRY" ? "Email already exists" : "Could not create admin" }); }
});
app.put("/api/admins/:id", async (req, res) => { const { name, email, role, isActive, profileImage } = req.body; try { await pool.execute("UPDATE admin_users SET name=?, email=?, role=?, is_active=?, profile_image=? WHERE id=?", [name,email,role,isActive === false ? 0 : 1,profileImage || null,req.params.id]); const [rows] = await pool.query("SELECT id,name,email,role,is_active AS isActive,last_login AS lastLogin,profile_image AS profileImage FROM admin_users WHERE id=?", [req.params.id]); res.json(rows[0]); } catch { res.status(400).json({ error: "Could not update admin" }); } });
app.delete("/api/admins/:id", async (req, res) => { try { const [result] = await pool.execute("DELETE FROM admin_users WHERE id=?", [req.params.id]); if (!result.affectedRows) return res.status(404).json({ error: "Admin not found" }); res.status(204).end(); } catch { res.status(400).json({ error: "Could not delete admin" }); } });
app.post("/api/admins/:id/password", async (req, res) => { const { password } = req.body; if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" }); try { const hash = await bcrypt.hash(password, 12); await pool.execute("UPDATE admin_users SET password_hash=? WHERE id=?", [hash, req.params.id]); res.json({ ok: true }); } catch { res.status(400).json({ error: "Could not change password" }); } });
app.get("/api/admins/:id/profile", async (req, res) => { try { const [rows] = await pool.query("SELECT id,name,email,role,is_active AS isActive,last_login AS lastLogin,profile_image AS profileImage,created_at AS createdAt FROM admin_users WHERE id=?", [req.params.id]); if (!rows[0]) return res.status(404).json({ error: "Admin not found" }); res.json(rows[0]); } catch { res.status(503).json({ error: "Could not load profile" }); } });
app.get("/api/admins/:id/permissions", async (req, res) => { try { const [rows] = await pool.query("SELECT permission_key FROM admin_permissions WHERE admin_id = ?", [req.params.id]); res.json(rows.map((r) => r.permission_key)); } catch { res.status(503).json({ error: "Could not load permissions" }); } });
app.put("/api/admins/:id/permissions", async (req, res) => { try { await pool.execute("DELETE FROM admin_permissions WHERE admin_id = ?", [req.params.id]); for (const permission of (req.body.permissions || [])) await pool.execute("INSERT INTO admin_permissions (admin_id,permission_key) VALUES (?,?)", [req.params.id, permission]); res.json({ ok: true }); } catch { res.status(400).json({ error: "Could not save permissions" }); } });
app.get("/api/activity-logs", async (_req, res) => { try { const [rows] = await pool.query("SELECT l.*, a.name AS admin_name FROM admin_activity_logs l LEFT JOIN admin_users a ON a.id=l.admin_id ORDER BY l.created_at DESC LIMIT 200"); res.json(rows); } catch { res.status(503).json({ error: "Could not load activity" }); } });
app.get("/api/admins", async (_req, res) => {
  try { const [rows] = await pool.query("SELECT id,name,email,role,is_active AS isActive,last_login AS lastLogin,created_at AS createdAt FROM admin_users ORDER BY id DESC"); res.json(rows); }
  catch { res.status(503).json({ error: "Could not load admins" }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute("SELECT id,name,email,password_hash AS passwordHash,role FROM admin_users WHERE email = ? AND is_active = 1", [email]);
    if (!rows[0] || !(await bcrypt.compare(password || "", rows[0].passwordHash))) return res.status(401).json({ error: "Invalid email or password" });
    const admin = rows[0]; await pool.execute("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [admin.id]);
    res.json({ token: jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "8h" }), admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch { res.status(503).json({ error: "Database unavailable" }); }
});

const fields = "id, slug, title, excerpt, category, date, read_time AS readTime, image, author, author_role AS authorRole, featured";
app.get("/api/dashboard/revenue", async (_req, res) => { try { const [rows] = await pool.query("SELECT label, amount, recorded_at AS recordedAt FROM revenue_records ORDER BY recorded_at"); res.json(rows); } catch { res.status(503).json({ error: "Revenue data unavailable" }); } });
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
  const data = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => key !== "id" && value !== undefined));
  if (!Object.keys(data).length) return res.status(400).json({ error: "Request body is empty" });
  try {
    const columns = Object.keys(data); const values = Object.values(data);
    const [result] = await pool.execute(`INSERT INTO ${resource.table} (${columns.map((c) => `\`${c}\``).join(",")}) VALUES (${columns.map(() => "?").join(",")})`, values);
    const [rows] = await pool.query(`SELECT * FROM ${resource.table} WHERE id = ?`, [result.insertId]); res.status(201).json(rows[0]);
  } catch (error) { res.status(400).json({ error: error.code === "ER_DUP_ENTRY" ? "Record already exists" : "Could not create record" }); }
});
app.put("/api/:resource/:id", async (req, res, next) => {
  const resource = resources[req.params.resource];
  if (!resource) return next();
  const data = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => key !== "id" && value !== undefined));
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
async function ensureProjectImageStorage() {
  try { await pool.query("ALTER TABLE projects MODIFY image MEDIUMTEXT NOT NULL"); }
  catch (error) { console.warn("project image storage check:", error.message); }
}

async function ensureAdminColumns() {
  try {
    await pool.query("ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE");
  } catch (error) {
    if (!String(error.code).includes("DUPLICATE") && error.code !== "ER_DUP_FIELDNAME") console.warn("is_active check:", error.message);
  }
  try {
    await pool.query("ALTER TABLE admin_users ADD COLUMN last_login TIMESTAMP NULL");
  } catch (error) {
    if (!String(error.code).includes("DUPLICATE") && error.code !== "ER_DUP_FIELDNAME") console.warn("last_login check:", error.message);
  }
}
ensureProjectImageStorage().then(() => ensureAdminColumns()).then(() => app.listen(port, "0.0.0.0", () => console.log(`CodeCraft API listening on ${port}`))).catch((error) => {
  console.error("Database setup failed:", error.message);
  app.listen(port, "0.0.0.0", () => console.log(`CodeCraft API listening on ${port} (database setup pending)`));
});
