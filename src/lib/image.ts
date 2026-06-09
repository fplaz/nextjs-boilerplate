import sharp from "sharp";

const MAX_DIMENSION = 512;

const FORMAT_MAP: Record<string, keyof sharp.FormatEnum> = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
};

export async function resizeImageIfNeeded(
  buffer: Buffer,
  mimeType: string
): Promise<Buffer> {
  // SVGs are vector — no resizing needed
  if (mimeType === "image/svg+xml") {
    return buffer;
  }

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return buffer;
  }

  const format = FORMAT_MAP[mimeType] ?? "png";

  return image
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
    .toFormat(format)
    .toBuffer();
}
