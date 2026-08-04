#!/usr/bin/env node
/**
 * Passenger / cPanel production entrypoint.
 * Passenger starts from the application root and expects this file.
 *
 * Next.js standalone server already respects:
 *   - process.env.PORT
 *   - process.env.HOSTNAME (defaults to 0.0.0.0 — never bind localhost-only)
 *   - process.env.NODE_ENV
 */
"use strict";

const fs = require("fs");
const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";

/**
 * Load KEY=VALUE files without overriding vars already set by Passenger/cPanel.
 * Standalone chdirs into `.next/standalone`, so we must load from project root first.
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(__dirname, ".env.production.local"));
loadEnvFile(path.join(__dirname, ".env.local"));
loadEnvFile(path.join(__dirname, ".env.production"));
loadEnvFile(path.join(__dirname, ".env"));

// Passenger / reverse proxies provide PORT. Bind all interfaces for VPS.
const host = process.env.HOSTNAME;
if (!host || host === "localhost" || host === "127.0.0.1") {
  process.env.HOSTNAME = "0.0.0.0";
}

if (!process.env.PORT && process.env.PASSENGER_PORT) {
  process.env.PORT = process.env.PASSENGER_PORT;
}

const standaloneServer = path.join(__dirname, ".next", "standalone", "server.js");

if (!fs.existsSync(standaloneServer)) {
  console.error(
    "[master-touch] Missing .next/standalone/server.js.\n" +
      "Run: npm run build && bash scripts/deploy-cpanel.sh\n" +
      "(or copy .next/static and public into .next/standalone first).",
  );
  process.exit(1);
}

const staticDir = path.join(__dirname, ".next", "standalone", ".next", "static");
const publicDir = path.join(__dirname, ".next", "standalone", "public");

if (!fs.existsSync(staticDir)) {
  console.warn(
    "[master-touch] Warning: .next/standalone/.next/static is missing. Assets may 404. Run scripts/deploy-cpanel.sh",
  );
}

if (!fs.existsSync(publicDir)) {
  console.warn(
    "[master-touch] Warning: .next/standalone/public is missing. Public files may 404. Run scripts/deploy-cpanel.sh",
  );
}

console.log(
  `[master-touch] Starting standalone (NODE_ENV=${process.env.NODE_ENV}, HOSTNAME=${process.env.HOSTNAME}, PORT=${process.env.PORT || 3000})`,
);

require(standaloneServer);
