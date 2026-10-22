/**
 * Runs before `prisma migrate deploy` on Vercel. Stops the deploy (without touching anything)
 * if DATABASE_URL points at a database created by the previous version of this store, whose
 * tables have the same names but a different structure. Point the deploy at a new, empty database.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name IN ('_prisma_migrations', 'Product', 'CmsConfig')`;
  const tables = new Set(rows.map((r) => r.table_name));
  if (!tables.has("_prisma_migrations") && (tables.has("Product") || tables.has("CmsConfig"))) {
    console.error(
      "\n✖ This database was created by the previous version of the store and is not compatible.\n" +
        "  Nothing has been changed. Create a new, empty database (e.g. a new Supabase project),\n" +
        "  update DATABASE_URL and DIRECT_URL in Vercel, and deploy again.\n",
    );
    process.exit(1);
  }
  console.log("✓ Database check passed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
