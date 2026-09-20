/* Generates server/seed-data.json from src/data/content.ts
   Run: node server/scripts/generate-seed.mjs  (requires Node 22.6+ for --experimental-strip-types) */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

const c = await import(join(root, "src", "data", "content.ts"));

const seed = {
  services: c.services,
  projects: c.projects,
  techCategories: c.techCategories,
  team: c.team,
  testimonials: c.testimonials,
  blogPosts: c.blogPosts,
  jobs: c.jobs.map(({ id, ...rest }) => ({ slug: id, ...rest })), // jobs keep their slug separately; real id comes from the DB
  processSteps: c.processSteps,
  whyChooseUs: c.whyChooseUs,
  navLinks: c.navLinks,
  messages: [
    { name: "Robert Hayes", email: "robert@techcorp.com", phone: "+1 (555) 010-2200", company: "TechCorp", service: "E-Commerce Development", budget: "$25,000 – $50,000", message: "E-commerce rebuild inquiry — our store is slow on mobile and we lose carts at checkout.", date: "Sep 14, 2026", status: "New" },
    { name: "Lisa Wong", email: "lisa@startup.io", phone: "+1 (555) 010-4821", company: "Startup.io", service: "Web Development", budget: "$10,000 – $25,000", message: "MVP development for a fintech product — need a React dashboard in 8 weeks.", date: "Sep 13, 2026", status: "Replied" },
    { name: "Omar Farouk", email: "omar@retail.com", phone: "+971 50 123 4567", company: "RetailMax", service: "Mobile App Development", budget: "$25,000 – $50,000", message: "Mobile app for inventory management across 20 stores.", date: "Sep 12, 2026", status: "New" },
    { name: "Anna Petrova", email: "anna@healthplus.eu", phone: "+44 20 7946 0102", company: "HealthPlus", service: "UI/UX Design", budget: "$5,000 – $10,000", message: "Patient portal redesign — usability testing showed major friction.", date: "Sep 11, 2026", status: "In Progress" },
    { name: "Carlos Mendez", email: "carlos@logistics.co", phone: "+34 91 123 4567", company: "LogiCo", service: "Software Development", budget: "$50,000+", message: "ERP integration support and legacy modernization.", date: "Sep 10, 2026", status: "Replied" },
  ],
  quotes: [
    { name: "Robert Hayes", email: "robert@techcorp.com", phone: "+1 (555) 010-2200", company: "TechCorp Ltd.", projectType: "New Project", service: "E-Commerce Development", budget: "$25,000 – $50,000", deadline: "1–2 months", details: "Headless storefront rebuild with Stripe and multi-currency.", date: "Sep 14, 2026", status: "Pending" },
    { name: "Lisa Wong", email: "lisa@startup.io", phone: "+1 (555) 010-4821", company: "Startup.io", projectType: "New Project", service: "Web Development", budget: "$10,000 – $25,000", deadline: "ASAP", details: "Fintech MVP dashboard with real-time transaction feeds.", date: "Sep 13, 2026", status: "Quoted" },
    { name: "Omar Farouk", email: "omar@retail.com", phone: "+971 50 123 4567", company: "RetailMax", projectType: "New Project", service: "Mobile App Development", budget: "$25,000 – $50,000", deadline: "3–6 months", details: "Inventory app for iOS and Android with barcode scanning.", date: "Sep 12, 2026", status: "Pending" },
    { name: "Anna Petrova", email: "anna@healthplus.eu", phone: "+44 20 7946 0102", company: "HealthPlus", projectType: "Redesign / Rebuild", service: "UI/UX Design", budget: "$5,000 – $10,000", deadline: "1–2 months", details: "Patient portal UX audit and redesign.", date: "Sep 11, 2026", status: "Accepted" },
    { name: "Carlos Mendez", email: "carlos@logistics.co", phone: "+34 91 123 4567", company: "LogiCo", projectType: "Ongoing Support", service: "Software Development", budget: "$50,000+", deadline: "Flexible", details: "ERP integration and long-term support contract.", date: "Sep 10, 2026", status: "Quoted" },
  ],
};

const out = join(__dirname, "..", "seed-data.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(seed, null, 2) + "\n");
console.log("seed-data.json written:", Object.keys(seed).map((k) => `${k}=${seed[k].length}`).join(", "));
