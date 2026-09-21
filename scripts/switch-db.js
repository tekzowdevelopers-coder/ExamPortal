const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const target = process.argv[2];

if (target !== "postgres" && target !== "sqlite") {
  console.log("Usage: node scripts/switch-db.js [postgres|sqlite]");
  process.exit(1);
}

const root = path.join(__dirname, "..");
const src = path.join(root, "prisma", `schema.${target === "postgres" ? "postgres" : "sqlite"}.prisma`);
const dest = path.join(root, "prisma", "schema.prisma");

fs.copyFileSync(src, dest);
console.log(`✓ Switched Prisma schema to ${target.toUpperCase()}`);

try {
  console.log("Generating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: root });
  console.log(`✓ Prisma client updated for ${target.toUpperCase()}`);
} catch (e) {
  console.error("Failed to generate Prisma client:", e.message);
}
