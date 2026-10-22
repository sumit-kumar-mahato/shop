// Saves a full copy of the store database to backups/<date>.sql using Docker's pg_dump.
// Usage: npm run db:backup        (reads DIRECT_URL, or DATABASE_URL, from .env)
// Restore into an empty database: docker run --rm -i postgres:16-alpine psql "<url>" < backups/<file>.sql
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync } from "node:fs";

try {
  process.loadEnvFile?.(".env");
} catch {
  // use real environment variables
}

const raw = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!raw) {
  console.error("Set DIRECT_URL or DATABASE_URL in .env first.");
  process.exit(1);
}

// pg_dump doesn't understand Prisma-only parameters, so move them out of the URL.
const url = new URL(raw);
const schema = url.searchParams.get("schema") || "public";
for (const p of ["schema", "pgbouncer", "connection_limit"]) url.searchParams.delete(p);
// Inside Docker, "localhost" means the container itself; point it at this computer instead.
if (url.hostname === "localhost" || url.hostname === "127.0.0.1") url.hostname = "host.docker.internal";

mkdirSync("backups", { recursive: true });
const file = `backups/store-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.sql`;
const out = createWriteStream(file);

console.log(`Backing up schema "${schema}" from ${url.hostname} …`);
const child = spawn("docker", ["run", "--rm", "postgres:16-alpine", "pg_dump", "--no-owner", "--no-privileges", "-n", schema, url.toString()], {
  stdio: ["ignore", "pipe", "inherit"],
});
child.stdout.pipe(out);
child.on("close", (code) => {
  if (code === 0) console.log(`✓ Saved ${file}`);
  else {
    console.error(`✖ Backup failed (exit code ${code}). Is Docker Desktop running?`);
    process.exit(code ?? 1);
  }
});
