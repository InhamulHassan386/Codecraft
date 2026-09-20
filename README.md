# CodeCraft Solutions — Dynamic Website + CMS (MySQL)

The whole website is now **database-driven**. Content lives in MySQL, and the
Admin Panel (`/#/admin`) can add, edit and delete anything — changes appear on
the website instantly.

---

## 1. Quick start (development)

```bash
# Terminal 1 — API server (MySQL + CMS backend), port 3001
npm run server

# Terminal 2 — website (Vite dev server), port 5173
npm run dev
```

Open **http://localhost:5173** — the site now loads all content from the API.
Open **http://localhost:5173/#/admin** to manage content.

**Default admin login:** `admin@codecraftsolutions.com` / `password`

> No MySQL installed? The server automatically falls back to a local JSON
> file store (`server/data/db.json`) with identical features — everything
> still works, and switches to MySQL the moment credentials are provided.

## 2. Connect MySQL (recommended)

1. Make sure MySQL/MariaDB is running.
2. Copy the env template and fill in your password:

   ```bash
   cp server/.env.example server/.env
   # edit server/.env → DB_USER / DB_PASSWORD / DB_NAME
   ```

3. Restart `npm run server`. It will:
   - create the database (`codecraft_cms`) if missing,
   - create all 13 tables (see `server/schema.sql`),
   - seed them with the website content on first boot,
   - create the default admin user.

The admin topbar shows a **“Database connected”** badge when MySQL is live.

## 3. What is dynamic?

| Area | Managed from Admin |
|---|---|
| Projects (Home + Portfolio) | Projects tab |
| Services (Home, Services, Footer) | Services tab |
| Technology categories & items | Technologies tab |
| Team members (Home, About, Team) | Team tab |
| Testimonials carousel | Testimonials tab |
| Blog posts | Blog tab |
| Job listings (Careers) | Careers tab |
| Process steps / Why-choose-us | `POST/PUT/DELETE /api/processSteps`, `/api/whyChooseUs` |
| Navbar & footer links | `/api/navLinks` |
| **Contact form submissions** | Messages tab (live) |
| **Quote requests** | Quote Requests tab (live) |

Every public page reads from `GET /api/content`; every admin action goes
through authenticated REST endpoints (JWT + bcrypt).

## 4. Production

```bash
npm run build          # builds single-file dist/index.html
npm run server         # serves dist/ + API together on :3001
```

With `dist/` present the API server also serves the website — one process,
one port. Behind nginx/Apache, proxy `/api` to port 3001.

## 5. Configuration reference (`server/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | API port |
| `DB_HOST` / `DB_PORT` | `127.0.0.1` / `3306` | MySQL host |
| `DB_USER` / `DB_PASSWORD` | `root` / — | MySQL credentials |
| `DB_NAME` | `codecraft_cms` | Database (auto-created) |
| `JWT_SECRET` | dev default | **Change in production** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@codecraftsolutions.com` / `password` | First-boot admin |

## 6. Project layout

```
server/            Express API + MySQL layer
  index.js         routes, auth (JWT), static serving
  db.js            MySQL pool + auto-schema + auto-seed + file-store fallback
  seed-data.json   initial content (generated from src/data/content.ts)
  schema.sql       reference DDL
  .env.example     configuration template
src/data/api.ts        frontend API client
src/data/ContentContext.tsx  global content provider (API + offline fallback)
src/pages/Admin.tsx    dynamic CMS panel (CRUD for every entity)
src/data/content.ts    bundled fallback content + TypeScript types
```

If the API is ever unreachable, the website still renders using the bundled
content in `src/data/content.ts` (admin switches to read-only demo mode).
