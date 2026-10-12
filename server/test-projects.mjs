// End-to-end test for the Projects API. Run while the API and MySQL are running:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run projects:test
// Optional: API_URL (default http://localhost:8787). It creates one test project and deletes it at the end.
const API = (process.env.API_URL || "http://localhost:8787").replace(/\/$/, "");
const EMAIL = process.env.ADMIN_EMAIL || "";
const PASSWORD = process.env.ADMIN_PASSWORD || "";
if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment before running this test.");
  process.exit(1);
}

const stamp = Date.now();
const slug = `test-project-${stamp}`;
let token = "";
let createdId = null;
let failures = 0;
let passes = 0;

const check = (label, condition, detail = "") => {
  if (condition) { passes += 1; console.log(`PASS  ${label}`); }
  else { failures += 1; console.log(`FAIL  ${label}${detail ? ` -> ${detail}` : ""}`); }
};
async function call(method, path, body, auth = true) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: response.status, json };
}
const baseProject = (overrides = {}) => ({
  name: `TEST Project ${stamp}`,
  slug,
  category: "Web",
  client: "Test Client",
  year: "2026",
  duration: "2 weeks",
  description: "Automated test project. Safe to delete.",
  long_description: "Long description for the automated test project.",
  image: "https://images.pexels.com/photos/6804068/pexels-photo-6804068.jpeg",
  technologies: "React, TypeScript, MySQL",
  results: "3x | Faster\n99% | Uptime",
  live_url: "https://example.com",
  github_url: "https://github.com/example/test-project",
  published: false,
  visible: true,
  featured: false,
  display_order: 999,
  ...overrides,
});

async function main() {
  // 1. Sign-in and authorization
  const login = await call("POST", "/api/auth/login", { email: EMAIL, password: PASSWORD }, false);
  check("admin sign-in succeeds with configured credentials", login.status === 200 && !!login.json?.token, `status ${login.status}`);
  token = login.json?.token || "";
  const wrong = await call("POST", "/api/auth/login", { email: EMAIL, password: `${PASSWORD}-wrong` }, false);
  check("wrong password is rejected", wrong.status === 401, `status ${wrong.status}`);
  const noAuthList = await call("GET", "/api/projects", undefined, false);
  check("admin list rejects requests without a token (401)", noAuthList.status === 401, `status ${noAuthList.status}`);
  const noAuthCreate = await call("POST", "/api/projects", baseProject(), false);
  check("create rejects requests without a token (401)", noAuthCreate.status === 401, `status ${noAuthCreate.status}`);
  const badToken = await fetch(`${API}/api/projects`, { headers: { Authorization: "Bearer not-a-real-token" } });
  check("forged token is rejected (401)", badToken.status === 401, `status ${badToken.status}`);

  // 2. Load existing projects from the database
  const list = await call("GET", "/api/projects?pageSize=50");
  check("admin list loads from the database", list.status === 200 && Array.isArray(list.json?.items), `status ${list.status}`);
  check("admin list includes counts", typeof list.json?.counts?.total === "number");

  // 3. Validation
  const invalid = await call("POST", "/api/projects", baseProject({ slug: "Bad Slug!", live_url: "javascript:alert(1)", year: "20x6" }));
  check("invalid slug, URL and year are rejected (400)", invalid.status === 400 && Array.isArray(invalid.json?.errors) && invalid.json.errors.length >= 3, `status ${invalid.status}`);
  const badGithub = await call("POST", "/api/projects", baseProject({ github_url: "https://example.com/repo" }));
  check("non-GitHub repository URL is rejected (400)", badGithub.status === 400, `status ${badGithub.status}`);
  const badImage = await call("POST", "/api/projects", baseProject({ image: "data:image/png;base64,aGVsbG8=" }));
  check("uploaded file whose content is not a real PNG is rejected (400)", badImage.status === 400, `status ${badImage.status}`);

  // 4. Add a draft project
  const created = await call("POST", "/api/projects", baseProject());
  check("create project returns 201", created.status === 201, `status ${created.status} ${JSON.stringify(created.json)}`);
  createdId = created.json?.id;
  check("created project has a database id and status Draft", !!createdId && created.json?.status === "Draft");

  const duplicate = await call("POST", "/api/projects", baseProject());
  check("duplicate slug is rejected (409)", duplicate.status === 409, `status ${duplicate.status}`);

  // 5. Draft is private
  const publicList = await call("GET", "/api/public/projects", undefined, false);
  check("draft project is NOT in the public list", Array.isArray(publicList.json) && !publicList.json.some((p) => p.slug === slug));
  const publicDetail = await call("GET", `/api/public/projects/${slug}`, undefined, false);
  check("draft project is NOT available from the public detail route (404)", publicDetail.status === 404, `status ${publicDetail.status}`);

  // 6. View
  const view = await call("GET", `/api/projects/${createdId}`);
  check("view returns the exact project by id", view.status === 200 && view.json?.slug === slug && view.json?.name === `TEST Project ${stamp}`);
  check("view returns technologies and results as arrays", Array.isArray(view.json?.technologies) && view.json.technologies.length === 3 && view.json?.results?.[0]?.value === "3x");

  // 7. Publish and verify on the public website
  const publish = await call("PUT", `/api/projects/${createdId}`, { published: true });
  check("publishing updates only the requested field", publish.status === 200 && publish.json?.published === true && publish.json?.name === `TEST Project ${stamp}`);
  const publicAfterPublish = await call("GET", "/api/public/projects", undefined, false);
  check("published project appears in the public list", publicAfterPublish.json?.some((p) => p.slug === slug) === true);
  const publicOne = await call("GET", `/api/public/projects/${slug}`, undefined, false);
  check("public detail returns the published project", publicOne.status === 200 && publicOne.json?.name === `TEST Project ${stamp}` && publicOne.json?.liveUrl === "https://example.com");

  // 8. Edit and verify persistence; the image must stay when no new image is sent
  const edit = await call("PUT", `/api/projects/${createdId}`, { name: `TEST Project ${stamp} (edited)`, featured: true });
  check("edit returns 200", edit.status === 200, `status ${edit.status}`);
  const reread = await call("GET", `/api/projects/${createdId}`);
  check("edited name persists after reload", reread.json?.name === `TEST Project ${stamp} (edited)`);
  check("edited featured flag persists", reread.json?.featured === true);
  check("existing image is kept when no new image is submitted", reread.json?.image === baseProject().image);
  const publicFeatured = await call("GET", "/api/public/projects", undefined, false);
  const publicCopy = publicFeatured.json?.find((p) => p.slug === slug);
  check("featured flag and edited name reach the public API", publicCopy?.featured === true && publicCopy?.name === `TEST Project ${stamp} (edited)`);

  // 9. Replace image with a new valid URL
  const newImage = "https://images.pexels.com/photos/6803554/pexels-photo-6803554.jpeg";
  const imageEdit = await call("PUT", `/api/projects/${createdId}`, { image: newImage });
  check("replacing the image saves the new URL", imageEdit.status === 200 && imageEdit.json?.image === newImage);

  // 10. Hide and show
  const hide = await call("PUT", `/api/projects/${createdId}`, { visible: false });
  check("hidden project is removed from the public list", hide.status === 200 && !(await call("GET", "/api/public/projects", undefined, false)).json?.some((p) => p.slug === slug));
  await call("PUT", `/api/projects/${createdId}`, { visible: true });

  // 11. Search, filter, status
  const bySearch = await call("GET", `/api/projects?q=${encodeURIComponent(`TEST Project ${stamp}`)}`);
  check("search returns only the matching project", bySearch.json?.items?.length === 1 && bySearch.json.items[0].id === createdId, `count ${bySearch.json?.items?.length}`);
  const byCategory = await call("GET", "/api/projects?category=Web&pageSize=50");
  check("category filter includes the test project", byCategory.json?.items?.some((p) => p.id === createdId) === true);
  const byStatus = await call("GET", "/api/projects?status=published&pageSize=50");
  check("status filter returns only published projects", byStatus.json?.items?.every((p) => p.published === true));
  const byFeatured = await call("GET", "/api/projects?featured=1&pageSize=50");
  check("featured filter returns only featured projects", byFeatured.json?.items?.every((p) => p.featured === true) && byFeatured.json?.items?.some((p) => p.id === createdId));

  // 12. Slug conflict on update
  const others = await call("GET", "/api/projects?pageSize=50");
  const other = others.json?.items?.find((p) => p.id !== createdId);
  if (other) {
    const conflict = await call("PUT", `/api/projects/${createdId}`, { slug: other.slug });
    check("changing to another project's slug is rejected (409)", conflict.status === 409, `status ${conflict.status}`);
  } else {
    console.log("SKIP  slug conflict on update (no other project exists)");
  }

  // 13. Delete only the test project
  const beforeDelete = await call("GET", "/api/projects?pageSize=50");
  const totalBefore = beforeDelete.json?.total;
  const del = await call("DELETE", `/api/projects/${createdId}`);
  check("delete returns 204", del.status === 204, `status ${del.status}`);
  const gone = await call("GET", `/api/projects/${createdId}`);
  check("deleted project no longer loads (404)", gone.status === 404);
  const afterDelete = await call("GET", "/api/projects?pageSize=50");
  check("exactly one project was removed", afterDelete.json?.total === totalBefore - 1, `before ${totalBefore}, after ${afterDelete.json?.total}`);
  createdId = null;
  const delAgain = await call("DELETE", `/api/projects/${stamp}`);
  check("deleting an unknown id returns 404", delAgain.status === 404);
}

try {
  await main();
} catch (error) {
  failures += 1;
  console.log(`FAIL  unexpected error: ${error.message}. Is the API running at ${API}?`);
} finally {
  if (createdId && token) {
    await call("DELETE", `/api/projects/${createdId}`).catch(() => {});
    console.log("INFO  cleaned up test project");
  }
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exitCode = failures ? 1 : 0;
}
