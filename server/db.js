/* ----------------------------------------------------------------------------
   db.js — data layer for CodeCraft CMS

   Two interchangeable backends behind one tiny API:
   · "mysql" — real MySQL/MariaDB via mysql2 pool (uses .env credentials).
               Tables are auto-created and auto-seeded on first boot.
   · "file"  — zero-dependency JSON store at server/data/db.json, used
               automatically when MySQL is unreachable. Same behaviour.

   Every content row stores the item object in a JSON column, so nested
   data (features lists, project results, tech items…) just works.
------------------------------------------------------------------------------ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const FILE_DB = path.join(DATA_DIR, "db.json");
const SEED = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

export const ENTITIES = [
  "services", "projects", "techCategories", "team", "testimonials",
  "blogPosts", "jobs", "processSteps", "whyChooseUs", "navLinks",
  "messages", "quotes",
]; // camelCase names used by the API…
const TABLE = (e) => e.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase()); // …snake_case tables

let mode = "file";
let pool = null;
const mem = { id: {}, data: {} }; // file-mode store

export function dbMode() {
  return mode;
}

/* ------------------------------ FILE STORE ------------------------------ */
function fileRead() {
  try {
    return JSON.parse(fs.readFileSync(FILE_DB, "utf8"));
  } catch {
    return null;
  }
}
function fileWrite() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = FILE_DB + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(mem.data, null, 1));
  fs.renameSync(tmp, FILE_DB);
}
function fileEnsure() {
  const existing = fileRead();
  mem.data = existing && typeof existing === "object" ? existing : {};
  for (const e of [...ENTITIES, "adminUsers"]) {
    if (!Array.isArray(mem.data[e])) mem.data[e] = [];
    mem.id[e] = mem.data[e].reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  }
}
const fileNextId = (e) => ++mem.id[e];

/* ------------------------------ MYSQL ------------------------------ */
async function mysqlConnect() {
  const cfg = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "codecraft_cms",
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 4000,
  };
  // create database if missing
  try {
    const tmp = await mysql.createConnection({ ...cfg, database: undefined });
    await tmp.query(
      `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await tmp.end();
  } catch {
    /* server may forbid CREATE DATABASE — the cfg.database connect below will tell */
  }
  pool = mysql.createPool(cfg);
  await pool.query("SELECT 1");
}

async function mysqlEnsureSchema() {
  for (const e of [...ENTITIES, "adminUsers"]) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS \`${TABLE(e)}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  }
}

/* --------------------------- SEEDING --------------------------- */
async function seedIfEmpty() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@codecraftsolutions.com";
  const adminPass = process.env.ADMIN_PASSWORD || "password";

  const countOf = async (e) => {
    if (mode === "mysql") {
      const [rows] = await pool.query(`SELECT COUNT(*) AS n FROM \`${TABLE(e)}\``);
      return rows[0].n;
    }
    return mem.data[e].length;
  };

  for (const e of ENTITIES) {
    if ((await countOf(e)) === 0) {
      const items = SEED[e] || [];
      for (const item of items) await insert(e, structuredClone(item));
    }
  }

  // default admin user
  if ((await countOf("adminUsers")) === 0) {
    const hash = await bcrypt.hash(adminPass, 10);
    await insert("adminUsers", { email: adminEmail, passwordHash: hash, name: "Admin", role: "Super Admin" });
    console.log(`[seed] admin user created → ${adminEmail} / ${adminPass}`);
  }
}

/* --------------------------- CRUD (unified) --------------------------- */
export async function list(e) {
  if (mode === "mysql") {
    const [rows] = await pool.query(`SELECT id, data FROM \`${TABLE(e)}\` ORDER BY id`);
    return rows.map((r) => ({ id: r.id, ...rowJson(r.data) }));
  }
  return mem.data[e].map((r) => ({ ...r }));
}

export async function get(e, id) {
  if (mode === "mysql") {
    const [rows] = await pool.query(`SELECT id, data FROM \`${TABLE(e)}\` WHERE id = ?`, [id]);
    return rows[0] ? { id: rows[0].id, ...rowJson(rows[0].data) } : null;
  }
  return mem.data[e].find((r) => r.id === Number(id)) || null;
}

export async function insert(e, obj) {
  const { id: _ignored, ...clean } = obj;
  if (mode === "mysql") {
    const [res] = await pool.query(`INSERT INTO \`${TABLE(e)}\` (data) VALUES (?)`, [JSON.stringify(clean)]);
    return { id: res.insertId, ...clean };
  }
  const row = { id: fileNextId(e), ...clean };
  mem.data[e].push(row);
  fileWrite();
  return { ...row };
}

export async function update(e, id, obj) {
  const { id: _ignored, ...clean } = obj;
  if (mode === "mysql") {
    await pool.query(`UPDATE \`${TABLE(e)}\` SET data = ? WHERE id = ?`, [JSON.stringify(clean), id]);
    return get(e, id);
  }
  const i = mem.data[e].findIndex((r) => r.id === Number(id));
  if (i === -1) return null;
  mem.data[e][i] = { id: Number(id), ...clean };
  fileWrite();
  return { ...mem.data[e][i] };
}

export async function remove(e, id) {
  if (mode === "mysql") {
    await pool.query(`DELETE FROM \`${TABLE(e)}\` WHERE id = ?`, [id]);
    return true;
  }
  const before = mem.data[e].length;
  mem.data[e] = mem.data[e].filter((r) => r.id !== Number(id));
  fileWrite();
  return mem.data[e].length < before;
}

function rowJson(d) {
  if (typeof d === "string") return JSON.parse(d);
  if (d && typeof d === "object") return JSON.parse(JSON.stringify(d)); // driver may pre-parse
  return {};
}

/* --------------------------- PUBLIC CONTENT --------------------------- */
export async function allContent() {
  const keys = ["services", "projects", "techCategories", "team", "testimonials", "blogPosts", "jobs", "processSteps", "whyChooseUs", "navLinks"];
  const out = {};
  for (const k of keys) out[k] = await list(k);
  return out;
}

/* --------------------------- INIT --------------------------- */
export async function initDb() {
  try {
    await mysqlConnect();
    mode = "mysql";
    await mysqlEnsureSchema();
    await seedIfEmpty();
    console.log("[db] connected to MySQL ✓ (database: " + (process.env.DB_NAME || "codecraft_cms") + ")");
  } catch (err) {
    mode = "file";
    pool = null;
    fileEnsure();
    await seedIfEmpty();
    console.log(`[db] MySQL not reachable (${err.code || err.message}) → using file store at server/data/db.json`);
    console.log("[db] Tip: set DB_HOST/DB_USER/DB_PASSWORD/DB_NAME in server/.env to use MySQL.");
  }
}

/* used by login */
export async function findAdminByEmail(email) {
  const users = await list("adminUsers");
  return users.find((u) => (u.email || "").toLowerCase() === String(email).toLowerCase()) || null;
}
