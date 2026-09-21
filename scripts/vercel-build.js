const { execSync } = require("child_process");

console.log("🚀 Starting Vercel deployment build...");

// 1. Generate Prisma Client
console.log("📦 Generating Prisma client...");
execSync("npx prisma generate", { stdio: "inherit" });

// 2. If a remote DATABASE_URL is configured (e.g. Postgres on Vercel / Neon / Supabase), apply schema & seed
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
if (dbUrl && !dbUrl.startsWith("file:")) {
  console.log("🗄️ Remote PostgreSQL database detected. Syncing schema and seed data...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    execSync("node prisma/seed.js", { stdio: "inherit" });
    console.log("✅ Remote database initialized and seeded successfully!");
  } catch (err) {
    console.warn("⚠️ Note during remote database setup:", err.message);
  }
} else {
  console.log("ℹ️ No remote DATABASE_URL provided during build or using local database.");
}

// 3. Build Next.js
console.log("⚡ Building Next.js application...");
execSync("npx next build", { stdio: "inherit" });
console.log("🎉 Build complete!");
