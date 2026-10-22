import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth/session";
import { PREVIEW_HEADER } from "@/lib/constants";
import { SETTINGS, draftKey, type SettingKey, type SettingValue } from "@/lib/settings-schema";

/** True when a signed-in staff member is viewing the site through the admin live preview. */
export const isPreviewRequest = cache(async (): Promise<boolean> => {
  let flagged = false;
  try {
    flagged = headers().get(PREVIEW_HEADER) === "1";
  } catch {
    return false; // outside a request (build time, scripts)
  }
  if (!flagged) return false;
  const user = await getCurrentUser();
  return Boolean(user && isStaff(user));
});

/**
 * Load a settings document, merged over defaults so newly added fields always have a value.
 * Invalid stored data falls back to defaults instead of crashing the site.
 * In the admin live preview, unpublished drafts are shown instead of the published version.
 */
export const getSettings = cache(async <K extends SettingKey>(key: K): Promise<SettingValue<K>> => {
  const { schema, defaults, previewable } = SETTINGS[key];
  const preview = previewable && (await isPreviewRequest());
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: preview ? [key, draftKey(key)] : [key] } } });
    const row = rows.find((r) => r.key === draftKey(key)) ?? rows.find((r) => r.key === key);
    if (!row) return defaults as SettingValue<K>;
    const parsed = schema.safeParse(deepMerge(defaults, row.value));
    if (parsed.success) return parsed.data as SettingValue<K>;
    console.warn(`[settings] stored "${row.key}" settings are invalid; using defaults`, parsed.error.issues[0]);
  } catch (err) {
    console.error(`[settings] failed to load "${key}"`, err);
  }
  return defaults as SettingValue<K>;
});

/** Validate and publish settings. Any draft for the same section is discarded. */
export async function saveSettings<K extends SettingKey>(key: K, value: unknown): Promise<SettingValue<K>> {
  const parsed = SETTINGS[key].schema.parse(value) as SettingValue<K>;
  const json = parsed as unknown as Prisma.InputJsonValue;
  await prisma.$transaction([
    prisma.setting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } }),
    prisma.setting.deleteMany({ where: { key: draftKey(key) } }),
  ]);
  return parsed;
}

/** Validate and store an unpublished draft for the admin live preview. */
export async function saveDraft<K extends SettingKey>(key: K, value: unknown): Promise<SettingValue<K>> {
  const parsed = SETTINGS[key].schema.parse(value) as SettingValue<K>;
  const json = parsed as unknown as Prisma.InputJsonValue;
  const k = draftKey(key);
  await prisma.setting.upsert({ where: { key: k }, create: { key: k, value: json }, update: { value: json } });
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
