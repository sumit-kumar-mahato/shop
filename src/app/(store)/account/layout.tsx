import { requireUserPage } from "@/lib/auth/session";
import AccountNav from "./AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserPage("/account");
  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="text-sm text-luxury-500">My account</p>
        <h1 className="font-serif text-3xl">Hello, {user.name.split(" ")[0]}</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav isStaff={user.role !== "CUSTOMER"} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
