import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id.replace(/\.[a-z]+$/, "");
  if (!/^[a-z0-9]{10,40}$/i.test(id)) return new Response("Not found", { status: 404 });

  if (req.headers.get("if-none-match") === `"${id}"`) {
    return new Response(null, { status: 304, headers: { ETag: `"${id}"` } });
  }

  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(image.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"${id}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
