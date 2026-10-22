import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl text-brand">404</p>
      <h1 className="mt-4 font-serif text-3xl">Page not found</h1>
      <p className="mt-2 max-w-md text-luxury-600 dark:text-zinc-400">The page you&apos;re looking for has moved or no longer exists.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-sm bg-luxury-900 px-6 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
          Go home
        </Link>
        <Link href="/shop" className="inline-flex h-11 items-center rounded-sm border border-luxury-300 px-6 text-sm font-semibold dark:border-zinc-700">
          Shop all
        </Link>
      </div>
    </div>
  );
}
