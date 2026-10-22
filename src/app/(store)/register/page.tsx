import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/utils";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeRedirectPath(searchParams.next, "");
  if (await getCurrentUser()) redirect(next || "/account");
  return <RegisterForm next={next} />;
}
