import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));
const db = mysql.createPool({ host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME || "codecraft" });
const port = Number(process.env.PORT || 8787);
app.get("/api/health", async (_req, res) => { try { await db.query("SELECT 1"); res.json({ ok: true, database: "mysql" }); } catch { res.status(503).json({ ok: false, database: "unavailable" }); } });
app.get("/api/projects", async (req, res) => { try { const q = String(req.query.q || ""); const [rows] = await db.query("SELECT * FROM projects WHERE name LIKE ? OR category LIKE ? OR client LIKE ? ORDER BY id DESC", [`%${q}%`, `%${q}%`, `%${q}%`]); res.json(rows); } catch { res.status(503).json({ error: "Could not load projects" }); } });
app.post("/api/projects", async (req, res) => { const allowed = ["name","slug","category","client","year","duration","description","long_description","image","technologies","results","published","featured"]; const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); if (!data.name || !data.slug || !data.category || !data.client || !data.year || !data.duration || !data.description) return res.status(400).json({ error: "Required project fields are missing" }); try { const columns = Object.keys(data); const values = columns.map((key) => ["technologies","results"].includes(key) && typeof data[key] !== "string" ? JSON.stringify(data[key]) : data[key]); const [result] = await db.execute(`INSERT INTO projects (${columns.map((key) => `\`${key}\``).join(",")}) VALUES (${columns.map(() => "?").join(",")})`, values); const [rows] = await db.query("SELECT * FROM projects WHERE id=?", [result.insertId]); res.status(201).json(rows[0]); } catch { res.status(400).json({ error: "Could not create project" }); } });
app.put("/api/projects/:id", async (req, res) => { const allowed = ["name","slug","category","client","year","duration","description","long_description","image","technologies","results","published","featured"]; const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); try { const keys = Object.keys(data); await db.execute(`UPDATE projects SET ${keys.map((key) => `\`${key}\`=?`).join(",")} WHERE id=?`, [...keys.map((key) => ["technologies","results"].includes(key) && typeof data[key] !== "string" ? JSON.stringify(data[key]) : data[key]), req.params.id]); const [rows] = await db.query("SELECT * FROM projects WHERE id=?", [req.params.id]); res.json(rows[0]); } catch { res.status(400).json({ error: "Could not update project" }); } });
app.delete("/api/projects/:id", async (req, res) => { try { const [result] = await db.execute("DELETE FROM projects WHERE id=?", [req.params.id]); if (!result.affectedRows) return res.status(404).json({ error: "Project not found" }); res.status(204).end(); } catch { res.status(400).json({ error: "Could not delete project" }); } });
app.listen(port, "0.0.0.0", () => console.log(`CodeCraft API listening on ${port}`));
