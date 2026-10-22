"use client";

import { createContext, useContext } from "react";
import { defaultThemeSettings, type ThemeSettings } from "@/lib/settings-schema";

/** Storefront display options from Admin → Appearance that client components need. */
type StoreUI = { card: ThemeSettings["productCard"] };

const StoreUIContext = createContext<StoreUI>({ card: defaultThemeSettings.productCard });

export function StoreUIProvider({ value, children }: { value: StoreUI; children: React.ReactNode }) {
  return <StoreUIContext.Provider value={value}>{children}</StoreUIContext.Provider>;
}

export const useStoreUI = () => useContext(StoreUIContext);

export const CARD_ASPECT: Record<ThemeSettings["productCard"]["imageRatio"], string> = {
  portrait: "aspect-[3/4]",
  classic: "aspect-[4/5]",
  tall: "aspect-[2/3]",
  square: "aspect-square",
};
