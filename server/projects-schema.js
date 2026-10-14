// Non-destructive schema check for the projects table.
// Adds only the columns that are missing. Never drops or recreates the table.
const REQUIRED_COLUMNS = [
  { name: "visible", sql: "ALTER TABLE projects ADD COLUMN visible BOOLEAN NOT NULL DEFAULT TRUE" },
  { name: "display_order", sql: "ALTER TABLE projects ADD COLUMN display_order INT NOT NULL DEFAULT 0" },
  { name: "live_url", sql: "ALTER TABLE projects ADD COLUMN live_url VARCHAR(500) NULL" },
  { name: "github_url", sql: "ALTER TABLE projects ADD COLUMN github_url VARCHAR(500) NULL" },
  { name: "gallery", sql: "ALTER TABLE projects ADD COLUMN gallery JSON NULL" },
];

export async function ensureProjectSchema(db) {
  const [rows] = await db.query(
    "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects'"
  );
  if (rows.length === 0) throw new Error("projects table not found. Run server/schema.sql first.");
  const existing = new Set(rows.map((row) => row.name));
  const added = [];
  for (const column of REQUIRED_COLUMNS) {
    if (!existing.has(column.name)) {
      await db.query(column.sql);
      added.push(column.name);
    }
  }
  return added;
}
