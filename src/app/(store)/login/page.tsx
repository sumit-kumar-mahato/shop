import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeRedirectPath(searchParams.next, "");
  const user = await getCurrentUser();
  if (user) redirect(next || (isStaff(user) ? "/admin" : "/account"));
  return <LoginForm next={next} />;
}
