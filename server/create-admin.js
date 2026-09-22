import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const [email, password, name = "Main Admin"] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error("Usage: npm run create-admin -- email password [name] (password must be 8+ characters)");
  process.exit(1);
}
const pool = await mysql.createPool({ host: process.env.DB_HOST || "127.0.0.1", port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || "root", password: process.env.DB_PASSWORD || "", database: process.env.DB_NAME || "codecraft" });
const hash = await bcrypt.hash(password, 12);
await pool.execute("INSERT INTO admin_users (name,email,password_hash,role,is_active) VALUES (?,?,?,'Super Admin',1) ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role='Super Admin', is_active=1", [name, email, hash]);
console.log(`Admin ready: ${email}`);
await pool.end();
