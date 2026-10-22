import { prisma } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/utils";
import { AdminPagination, PageHeader, Panel, Table, Td, Th } from "@/components/admin/ui";

export const metadata = { title: "Activity log" };
const PER_PAGE = 50;

export default async function AdminActivity({ searchParams }: { searchParams: { page?: string } }) {
  await requireStaffPage({ adminOnly: true });
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const [total, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { actor: { select: { name: true, email: true } } } }),
  ]);

  return (
    <div>
      <PageHeader title="Activity log" description="Every change made in the admin panel, for accountability and troubleshooting." />
      <Panel padded={false}>
        <Table>
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Who</Th>
              <Th>Action</Th>
              <Th>Details</Th>
              <Th>IP</Th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <Td className="whitespace-nowrap text-zinc-500">{formatDateTime(l.createdAt)}</Td>
                <Td>{l.actor?.name ?? "—"}</Td>
                <Td className="font-mono text-xs">{l.action}</Td>
                <Td className="max-w-md truncate text-xs text-zinc-500">{l.details ? JSON.stringify(l.details) : l.entityId}</Td>
                <Td className="font-mono text-xs text-zinc-500">{l.ip ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {logs.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No activity yet.</p>}
        <AdminPagination page={page} pageCount={Math.ceil(total / PER_PAGE)} baseHref={(p) => `/admin/activity?page=${p}`} />
      </Panel>
    </div>
  );
}
