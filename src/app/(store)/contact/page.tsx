import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth/session";
import { Card } from "@/components/ui/Misc";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage() {
  const [store, user] = await Promise.all([getSettings("store"), getCurrentUser()]);
  const whatsapp = store.whatsappNumber.replace(/\D/g, "");

  return (
    <div className="container-page py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-serif text-4xl">Get in touch</h1>
        <p className="mt-3 text-luxury-600 dark:text-zinc-400">Questions about sizing, an order, or a custom request? We&apos;re happy to help.</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <Card className="p-6 sm:p-8">
          <ContactForm defaultName={user?.name ?? ""} defaultEmail={user?.email ?? ""} />
        </Card>
        <div className="space-y-4 text-sm">
          {store.address && <Info icon={<MapPin size={18} />} title="Visit our store">{store.address}</Info>}
          {store.contactPhone && (
            <Info icon={<Phone size={18} />} title="Call us">
              <a href={`tel:${store.contactPhone.replace(/\s/g, "")}`} className="hover:underline">{store.contactPhone}</a>
            </Info>
          )}
          {whatsapp && (
            <Info icon={<MessageCircle size={18} />} title="WhatsApp">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Chat with us</a>
            </Info>
          )}
          <Info icon={<Mail size={18} />} title="Email">
            <a href={`mailto:${store.contactEmail}`} className="hover:underline">{store.contactEmail}</a>
          </Info>
          {store.businessHours && <Info icon={<Clock size={18} />} title="Hours">{store.businessHours}</Info>}
        </div>
      </div>
    </div>
  );
}

function Info({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="flex gap-4 p-5">
      <span className="text-brand">{icon}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <div className="text-luxury-600 dark:text-zinc-400">{children}</div>
      </div>
    </Card>
  );
}
