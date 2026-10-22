/** Re-mounts on every page change, giving each page a soft fade-in. */
export default function StoreTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
