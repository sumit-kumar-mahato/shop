import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUserPage } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Misc";
import SecurityForms from "./SecurityForms";

export const metadata: Metadata = { title: "Security", robots: { index: false } };

export default async function SecurityPage() {
  const user = await requireUserPage("/account/security");
  const sessions = await prisma.session.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <SecurityForms otherSessions={sessions.length - 1} />
      <Card className="p-6">
        <h2 className="mb-4 font-serif text-xl">Active sign-ins</h2>
        <ul className="divide-y divide-luxury-100 text-sm dark:divide-zinc-800">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{describeAgent(s.userAgent)}</p>
                <p className="text-xs text-luxury-500">Signed in {formatDateTime(s.createdAt)}</p>
              </div>
              {s.id === user.sessionId && <span className="text-xs font-semibold text-green-700 dark:text-green-400">This device</span>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function describeAgent(ua: string | null) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return `${browser}${os ? ` on ${os}` : ""}`;
}
