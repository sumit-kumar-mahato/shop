import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Misc";
import MessageActions from "@/components/admin/MessageActions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function AdminMessages({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = searchParams.tab === "subscribers" ? "subscribers" : "inbox";
  const [messages, subscribers, subscriberCount] = await Promise.all([
    tab === "inbox" ? prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }) : [],
    tab === "subscribers" ? prisma.newsletterSubscriber.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" }, take: 1000 }) : [],
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Messages" description="Contact-form enquiries and newsletter subscribers." />
      <div className="mb-4 flex gap-1">
        {[
          { key: "inbox", label: "Inbox" },
          { key: "subscribers", label: `Newsletter (${subscriberCount})` },
        ].map((t) => (
          <Link key={t.key} href={`/admin/messages?tab=${t.key}`} className={cn("rounded-full px-3 py-1.5 text-sm", tab === t.key ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800")}>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "inbox" ? (
        <Panel padded={false}>
          {messages.length === 0 ? (
            <p className="p-8 text-center text-sm text-zinc-500">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {messages.map((m) => (
                <li key={m.id} className={cn("p-5", !m.isRead && "bg-blue-50/50 dark:bg-blue-950/20")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {m.subject} {!m.isRead && <Badge tone="blue">New</Badge>}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="hover:underline">{m.email}</a>
                        {m.phone && <> · <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a></>} · {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                    <MessageActions id={m.id} isRead={m.isRead} email={m.email} subject={m.subject} />
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : (
        <Panel
          padded={false}
          title={`${subscriberCount} subscribers`}
          actions={
            subscribers.length > 0 && (
              <a
                href={`data:text/csv;charset=utf-8,${encodeURIComponent("email,subscribed\n" + subscribers.map((s) => `${s.email},${s.createdAt.toISOString().slice(0, 10)}`).join("\n"))}`}
                download="newsletter-subscribers.csv"
                className="text-sm font-medium hover:underline"
              >
                Download CSV
              </a>
            )
          }
        >
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {subscribers.map((s) => (
              <li key={s.id} className="flex justify-between px-5 py-2.5">
                <span>{s.email}</span>
                <span className="text-zinc-500">{formatDateTime(s.createdAt)}</span>
              </li>
            ))}
          </ul>
          {subscribers.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No subscribers yet.</p>}
        </Panel>
      )}
    </div>
  );
}
