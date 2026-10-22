export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="container-page flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-luxury-600 dark:text-zinc-400">{subtitle}</p>}
        </div>
        <div className="rounded-sm border border-luxury-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-luxury-600 dark:text-zinc-400">{footer}</div>}
      </div>
    </div>
  );
}
