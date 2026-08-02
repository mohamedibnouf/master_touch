/**
 * Builds supabase/seed.sql from supabase/seed/*.sql in lexicographic order.
 * Supabase CLI v2 does not support psql \i — the concatenated seed.sql is the
 * single registered entry in config.toml [db.seed].sql_paths.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = path.join(root, "supabase", "seed");
const outFile = path.join(root, "supabase", "seed.sql");

const EXPECTED = [
  "01_roles_permissions.sql",
  "02_super_admin.sql",
  "03_theme_settings.sql",
  "04_translations.sql",
  "05_homepage_sections.sql",
  "06_about.sql",
  "07_services.sql",
  "08_contact.sql",
  "09_seo_defaults.sql",
];

function main() {
  const found = fs
    .readdirSync(seedDir)
    .filter((name) => name.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, "en"));

  if (found.length !== EXPECTED.length || found.some((name, i) => name !== EXPECTED[i])) {
    throw new Error(
      `Seed module mismatch.\nExpected:\n  ${EXPECTED.join("\n  ")}\nFound:\n  ${found.join("\n  ")}`,
    );
  }

  const seen = new Set();
  const parts = [
    "-- =============================================================================",
    "-- Master Touch — default seed entrypoint (AUTO-GENERATED)",
    "-- Do not edit by hand. Regenerate: npm run db:seed:build",
    "-- Sources: supabase/seed/01_*.sql … 09_*.sql (each included exactly once).",
    "-- Registered in supabase/config.toml → [db.seed].sql_paths = [\"./seed.sql\"]",
    "-- =============================================================================",
    "",
  ];

  for (const name of EXPECTED) {
    if (seen.has(name)) {
      throw new Error(`Duplicate seed module: ${name}`);
    }
    seen.add(name);

    const abs = path.join(seedDir, name);
    const sql = fs.readFileSync(abs, "utf8").replace(/\s+$/u, "\n");
    parts.push(`-- >>> BEGIN seed/${name}`);
    parts.push(sql.endsWith("\n") ? sql.slice(0, -1) : sql);
    parts.push(`-- <<< END seed/${name}`);
    parts.push("");
  }

  fs.writeFileSync(outFile, `${parts.join("\n")}\n`, "utf8");

  // Validate: each module marker appears once
  const built = fs.readFileSync(outFile, "utf8");
  for (const name of EXPECTED) {
    const begin = (built.match(new RegExp(`-- >>> BEGIN seed/${name}`, "g")) ?? []).length;
    const end = (built.match(new RegExp(`-- <<< END seed/${name}`, "g")) ?? []).length;
    if (begin !== 1 || end !== 1) {
      throw new Error(`Validation failed for ${name}: begin=${begin} end=${end}`);
    }
  }

  console.log(`OK: wrote ${path.relative(root, outFile)} from ${EXPECTED.length} modules (no duplicates).`);
}

main();
