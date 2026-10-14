// One-time import of the projects that were previously hardcoded in src/data/content.ts.
// Safe to run more than once: a project is inserted only when its slug does not exist yet.
// Usage:  npm run projects:import            (inserts missing projects)
//         npm run projects:import -- --dry-run (shows what would happen, writes nothing)
import "dotenv/config";
import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";
import { ensureProjectSchema } from "./projects-schema.js";

const dryRun = process.argv.includes("--dry-run");
const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "codecraft",
});

try {
  const items = JSON.parse(await readFile(new URL("./data/initial-projects.json", import.meta.url), "utf8"));
  if (!dryRun) await ensureProjectSchema(db);
  const inserted = [];
  const skipped = [];
  for (const [index, item] of items.entries()) {
    const [[existing]] = await db.query("SELECT id FROM projects WHERE slug = ? LIMIT 1", [item.slug]);
    if (existing) { skipped.push(item.slug); continue; }
    if (!dryRun) {
      await db.execute(
        "INSERT INTO projects (name, slug, category, client, year, duration, description, long_description, image, technologies, results, published, featured, visible, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1, ?)",
        [item.name, item.slug, item.category, item.client, item.year, item.duration, item.description, item.longDescription, item.image, JSON.stringify(item.technologies), JSON.stringify(item.results), index + 1]
      );
    }
    inserted.push(item.slug);
  }
  console.log(`${dryRun ? "[dry run] Would insert" : "Inserted"}: ${inserted.length ? inserted.join(", ") : "none"}`);
  console.log(`Skipped (slug already exists): ${skipped.length ? skipped.join(", ") : "none"}`);
} catch (error) {
  console.error("Import failed:", error.code || "", error.sqlMessage || error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
