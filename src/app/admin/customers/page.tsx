import Link from "next/link";
import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { REVENUE_STATUSES, ROLE_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { AdminPagination, PageHeader, Panel, Table, Td, Th, withParams } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Misc";

export const metadata = { title: "Customers" };
const PER_PAGE = 30;

export default async function AdminCustomers({ searchParams }: { searchParams: { q?: string; role?: string; page?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const where: Prisma.UserWhereInput = {};
  const q = searchParams.q?.trim();
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }];
  if (searchParams.role && searchParams.role in ROLE_LABELS) where.role = searchParams.role as Role;

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
  ]);
  const spend = await prisma.order.groupBy({
    by: ["userId"],
    where: { userId: { in: users.map((u) => u.id) }, status: { in: REVENUE_STATUSES } },
    _sum: { total: true },
    _count: { _all: true },
  });
  const spendBy = new Map(spend.map((s) => [s.userId, s]));

  return (
    <div>
      <PageHeader title="Customers" description={`${total} ${total === 1 ? "account" : "accounts"}`} />
      <Panel padded={false}>
        <form className="flex flex-wrap gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <input name="q" defaultValue={q} placeholder="Search name, email or phone…" className="h-10 min-w-[220px] flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          <select name="role" defaultValue={searchParams.role ?? ""} className="h-10 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="">All roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrators</option>
          </select>
          <button className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">Search</button>
        </form>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Joined</Th>
              <Th>Role</Th>
              <Th className="text-right">Orders</Th>
              <Th className="text-right">Spent</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const s = spendBy.get(u.id);
              return (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <Td>
                    <Link href={`/admin/customers/${u.id}`} className="font-medium hover:underline">{u.name}</Link>
                    <p className="text-xs text-zinc-500">{u.email}{!u.emailVerifiedAt && " · unverified"}</p>
                  </Td>
                  <Td className="text-zinc-500">{formatDate(u.createdAt)}</Td>
                  <Td>
                    {u.role !== "CUSTOMER" ? <Badge tone="purple">{ROLE_LABELS[u.role]}</Badge> : <span className="text-zinc-500">Customer</span>}
                    {!u.isActive && <Badge tone="red" className="ml-1">Disabled</Badge>}
                  </Td>
                  <Td className="text-right tabular-nums">{s?._count._all ?? 0}</Td>
                  <Td className="text-right tabular-nums">{formatINR(s?._sum.total ?? 0)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {users.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No accounts found.</p>}
        <AdminPagination page={page} pageCount={Math.ceil(total / PER_PAGE)} baseHref={(p) => withParams("/admin/customers", searchParams, { page: p })} />
      </Panel>
    </div>
  );
}
