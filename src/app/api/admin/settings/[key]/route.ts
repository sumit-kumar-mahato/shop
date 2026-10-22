import { revalidatePath } from "next/cache";
import { ApiError, ok, requireStaff, route } from "@/lib/api";
import { saveSettings } from "@/lib/settings";
import { SETTINGS, type SettingKey } from "@/lib/settings-schema";
import { audit } from "@/lib/audit";

export const PUT = route(async (req, { params }) => {
  const key = params.key as SettingKey;
  if (!(key in SETTINGS)) throw new ApiError(404, "Unknown settings section.");
  // Store-wide settings (payments, tax, shipping) are administrator-only; content can be edited by staff.
  const staff = await requireStaff({ adminOnly: key === "store" });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
  const saved = await saveSettings(key, body);
  revalidatePath("/", "layout");
  await audit(staff.id, "settings.update", "Setting", key);
  return ok({ settings: saved });
});
