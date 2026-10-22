import { revalidatePath } from "next/cache";
import { ApiError, ok, requireStaff, route } from "@/lib/api";
import { saveDraft, saveSettings } from "@/lib/settings";
import { SETTINGS, type SettingKey } from "@/lib/settings-schema";
import { audit } from "@/lib/audit";

// PUT            → validate and publish the settings section.
// PUT ?draft=1   → validate and store an unpublished draft, shown only in the admin live preview.
export const PUT = route(async (req, { params }) => {
  const key = params.key as SettingKey;
  if (!Object.prototype.hasOwnProperty.call(SETTINGS, key)) throw new ApiError(404, "Unknown settings section.");
  // Store-wide settings (payments, tax, shipping) are administrator-only; design and content can be edited by staff.
  const staff = await requireStaff({ adminOnly: SETTINGS[key].adminOnly });
  const draft = new URL(req.url).searchParams.get("draft") === "1";
  if (draft && !SETTINGS[key].previewable) throw new ApiError(400, "This section has no live preview.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
  if (draft) return ok({ settings: await saveDraft(key, body) });

  const saved = await saveSettings(key, body);
  revalidatePath("/", "layout");
  await audit(staff.id, "settings.update", "Setting", key);
  return ok({ settings: saved });
});
