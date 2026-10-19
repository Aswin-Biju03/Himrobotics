import { IMAGE_MAP } from "../../lib/images.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const raw = searchParams.get("url") || "";

  let name = "";

  try {
    name = decodeURIComponent(raw);
  } catch {
    name = raw;
  }

  name = name.split("?")[0].split("/").pop();

  const base = IMAGE_MAP[name];

  if (!base) {
    return new Response("Image not found", {
      status: 404,
    });
  }

  const width = searchParams.get("w") || "1600";

  return Response.redirect(
    new URL(`/images/${base}-${width}.png`, request.url),
    307,
  );
}
