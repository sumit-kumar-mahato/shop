import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SETTINGS, type SettingKey, type SettingValue } from "@/lib/settings-schema";

/**
 * Load a settings document, merged over defaults so newly added fields always have a value.
 * Invalid stored data falls back to defaults instead of crashing the site.
 */
export const getSettings = cache(async <K extends SettingKey>(key: K): Promise<SettingValue<K>> => {
  const { schema, defaults } = SETTINGS[key];
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (!row) return defaults as SettingValue<K>;
    const merged = deepMerge(defaults, row.value);
    const parsed = schema.safeParse(merged);
    if (parsed.success) return parsed.data as SettingValue<K>;
    console.warn(`[settings] stored "${key}" settings are invalid; using defaults`, parsed.error.issues[0]);
  } catch (err) {
    console.error(`[settings] failed to load "${key}"`, err);
  }
  return defaults as SettingValue<K>;
});

export async function saveSettings<K extends SettingKey>(key: K, value: unknown): Promise<SettingValue<K>> {
  const parsed = SETTINGS[key].schema.parse(value) as SettingValue<K>;
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: parsed as unknown as Prisma.InputJsonValue },
    update: { value: parsed as unknown as Prisma.InputJsonValue },
  });
  return parsed;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(base: unknown, override: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(override)) return override === undefined ? base : override;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = k in base ? deepMerge((base as Record<string, unknown>)[k], v) : v;
  }
  return out;
}
