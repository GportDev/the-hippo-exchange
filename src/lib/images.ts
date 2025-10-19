/**
 * Returns a Cloudinary URL with lightweight transformation parameters applied.
 * Falls back to the original URL when the host is not Cloudinary.
 */
export function optimizeImageUrl(url?: string | null, width = 800): string | undefined {
  if (!url) return url ?? undefined;

  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("res.cloudinary.com")) {
      return url;
    }

    const transformation = `f_auto,q_auto,c_fill,w_${width}`;

    // Insert transformation segment right after /upload/
    const parts = parsed.pathname.split("/upload/");
    if (parts.length !== 2) {
      return url;
    }

    parsed.pathname = `${parts[0]}/upload/${transformation}/${parts[1]}`;
    return parsed.toString();
  } catch {
    return url;
  }
}
