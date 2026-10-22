import { prisma } from "@/lib/db";
import { ApiError, ok, requireStaff, route } from "@/lib/api";
import { MAX_UPLOAD_BYTES, sniffImageType } from "@/lib/images";
import { rateLimit } from "@/lib/rate-limit";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export const POST = route(async (req) => {
  const staff = await requireStaff();
  const limit = await rateLimit(`upload:user:${staff.id}`, 200, 3600);
  if (!limit.ok) throw new ApiError(429, "Upload limit reached. Please try again later.");

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") throw new ApiError(400, "No file received.");
  if (file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, "Image is too large (max 4 MB).");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniffImageType(bytes);
  if (!mimeType) throw new ApiError(415, "Only JPEG, PNG, WebP or GIF images are allowed.");

  const image = await prisma.image.create({
    data: { data: Buffer.from(bytes), mimeType, size: bytes.length, filename: file.name.slice(0, 200), uploadedBy: staff.id },
    select: { id: true },
  });
  return ok({ id: image.id, url: `/api/images/${image.id}.${EXT[mimeType]}` }, { status: 201 });
});
