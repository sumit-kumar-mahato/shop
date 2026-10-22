import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "brand" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-luxury-900 text-white hover:bg-luxury-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
  brand: "bg-brand text-brand-fg hover:bg-brand/90",
  secondary: "bg-luxury-100 text-luxury-900 hover:bg-luxury-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
  outline: "border border-luxury-300 text-luxury-900 hover:border-luxury-900 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-400",
  ghost: "text-luxury-700 hover:bg-luxury-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

type LinkButtonProps = React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size; fullWidth?: boolean };

export function LinkButton({ variant = "primary", size = "md", fullWidth, className, ...props }: LinkButtonProps) {
  return <Link className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)} {...props} />;
}
