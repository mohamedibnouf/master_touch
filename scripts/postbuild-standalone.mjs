#!/usr/bin/env node
/**
 * Runs after `next build --webpack`.
 * Copies static + public into `.next/standalone` so `npm run start` works
 * without requiring a separate bash deploy step on every local/CI build.
 * Safe on Windows and Linux (no shell cp required).
 */
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, unlinkSync, statSync } from "fs";
import { join } from "path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const serverJs = join(standalone, "server.js");
const staticSrc = join(root, ".next", "static");
const publicSrc = join(root, "public");

if (!existsSync(serverJs)) {
  console.warn("[postbuild-standalone] No standalone server.js — skip asset copy.");
  process.exit(0);
}

mkdirSync(join(standalone, ".next"), { recursive: true });

const staticDest = join(standalone, ".next", "static");
if (existsSync(staticSrc)) {
  rmSync(staticDest, { recursive: true, force: true });
  cpSync(staticSrc, staticDest, { recursive: true });
  console.log("[postbuild-standalone] Copied .next/static → standalone");
} else {
  console.warn("[postbuild-standalone] Missing .next/static");
}

const publicDest = join(standalone, "public");
if (existsSync(publicSrc)) {
  rmSync(publicDest, { recursive: true, force: true });
  cpSync(publicSrc, publicDest, { recursive: true });
  console.log("[postbuild-standalone] Copied public → standalone");
} else {
  console.warn("[postbuild-standalone] Missing public/");
}

function removeMaps(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "cache") {
        rmSync(full, { recursive: true, force: true });
        continue;
      }
      removeMaps(full);
    } else if (name.endsWith(".map") || name.endsWith(".tsbuildinfo")) {
      unlinkSync(full);
    }
  }
}

removeMaps(standalone);
console.log("[postbuild-standalone] Pruned *.map / cache from standalone");
console.log("[postbuild-standalone] Ready — start with: npm run start");
