# CodeCraft Solutions

## Dynamic content / MySQL

The Blog page and Admin Blog section now read from a MySQL-backed API. The browser falls back to the bundled seed posts when the database is not configured, so the static site still works in preview/development.

1. Copy `.env.example` to `.env` and set the MySQL credentials.
2. Create the database/table: `mysql -u root -p < server/schema.sql`.
3. Start the API: `npm run api`.
4. Start Vite in another terminal: `npm run dev`.

The API provides:

- `GET /api/blogs` — published posts for the public Blog page and Admin.
- `POST /api/blogs` — create a post from a future/admin form integration.
- `DELETE /api/blogs/:id` — delete a post from Admin.
- `GET /api/health` — database health check.

For production, deploy `server/index.js` with the MySQL database and set `VITE_API_URL` to the API base URL. Keep database credentials server-side; never put them in Vite client variables.
