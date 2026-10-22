import { cn } from "@/lib/utils";

export type LogoConfig = { text: string; image: string; darkImage: string; height: number };

/**
 * The store logo: an uploaded image (with an optional light version for dark backgrounds)
 * or, when no image is set, the logo text in the chosen logo font.
 */
export default function Logo({ logo, onDark, className, textClassName }: { logo: LogoConfig; onDark?: boolean; className?: string; textClassName?: string }) {
  if (!logo.image) return <span className={cn("font-display font-bold", textClassName)}>{logo.text}</span>;

  const style = { height: logo.height, maxHeight: "100%" };
  const imgCls = cn("w-auto max-w-[180px] object-contain sm:max-w-[260px]", className);
  if (onDark) return <img src={logo.darkImage || logo.image} alt={logo.text} style={style} className={imgCls} />;
  if (!logo.darkImage) return <img src={logo.image} alt={logo.text} style={style} className={imgCls} />;
  return (
    <>
      <img src={logo.image} alt={logo.text} style={style} className={cn(imgCls, "dark:hidden")} />
      <img src={logo.darkImage} alt={logo.text} style={style} className={cn(imgCls, "hidden dark:block")} />
    </>
  );
}
