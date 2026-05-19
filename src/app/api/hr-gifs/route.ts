import { readdir } from "fs/promises";
import path from "path";

const IMAGE_EXT = /\.(gif|webp|png|jpe?g|apng)$/i;

/** Lists images in `public/gifs` — drop new files there; no code changes needed. */
export async function GET() {
  const dir = path.join(process.cwd(), "public", "gifs");

  try {
    const files = await readdir(dir);
    const gifs = files
      .filter((f) => IMAGE_EXT.test(f))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => `/gifs/${encodeURIComponent(f)}`);

    return Response.json({ gifs });
  } catch {
    return Response.json({ gifs: [] });
  }
}
