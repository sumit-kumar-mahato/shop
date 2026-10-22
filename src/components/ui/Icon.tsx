import {
  BadgeCheck,
  Clock,
  CreditCard,
  Gift,
  Heart,
  Leaf,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Ruler,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/settings-schema";

const ICON_COMPONENTS: Record<IconName, React.ComponentType<LucideProps>> = {
  truck: Truck,
  refresh: RefreshCw,
  card: CreditCard,
  shield: ShieldCheck,
  gift: Gift,
  star: Star,
  phone: Phone,
  leaf: Leaf,
  ruler: Ruler,
  sparkles: Sparkles,
  heart: Heart,
  clock: Clock,
  package: Package,
  map: MapPin,
  scissors: Scissors,
  badge: BadgeCheck,
};

/** Renders one of the icons the admin can choose in the website editors. */
export default function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const Component = ICON_COMPONENTS[name] ?? Star;
  return <Component aria-hidden {...props} />;
}
