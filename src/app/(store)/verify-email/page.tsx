import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { consumeAuthToken } from "@/lib/auth/tokens";
import AuthShell from "@/components/store/AuthShell";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Verify email", robots: { index: false } };

export default async function VerifyEmailPage({ searchParams }: { searchParams: { token?: string } }) {
  const userId = searchParams.token ? await consumeAuthToken(searchParams.token, "EMAIL_VERIFICATION") : null;
  if (userId) await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });

  return userId ? (
    <AuthShell title="Email verified">
      <div className="space-y-4 text-center">
        <CheckCircle2 size={44} className="mx-auto text-green-600" />
        <p className="text-sm text-luxury-600 dark:text-zinc-400">Thank you — your email address is confirmed.</p>
        <LinkButton href="/shop" fullWidth>Continue shopping</LinkButton>
      </div>
    </AuthShell>
  ) : (
    <AuthShell title="Link expired">
      <div className="space-y-4 text-center">
        <XCircle size={44} className="mx-auto text-red-500" />
        <p className="text-sm text-luxury-600 dark:text-zinc-400">This verification link is invalid or has already been used. You can request a new one from your account page.</p>
        <LinkButton href="/account" fullWidth>Go to my account</LinkButton>
      </div>
    </AuthShell>
  );
}
