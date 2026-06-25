export type MediaLike = {
  type?: string | null;
  mimeType?: string | null;
  mime?: string | null;
};

const EXTENSION_MIME_MAP: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  webm: "video/webm",
  ogv: "video/ogg",
  ogg: "video/ogg",
};

function getExtension(filename: string): string {
  const normalized = filename.trim().toLowerCase();
  const lastDot = normalized.lastIndexOf(".");
  if (lastDot < 0 || lastDot === normalized.length - 1) {
    return "";
  }
  return normalized.slice(lastDot + 1);
}

export function inferMimeTypeFromFilename(filename: string): string | undefined {
  const extension = getExtension(filename);
  return EXTENSION_MIME_MAP[extension];
}

export function resolveUploadMimeType(
  file: Pick<File, "name" | "type">,
): string {
  const currentType = (file.type || "").trim().toLowerCase();
  if (currentType && currentType !== "application/octet-stream") {
    return currentType;
  }
  return inferMimeTypeFromFilename(file.name) || "application/octet-stream";
}

export function normalizeUploadFile(file: File): File {
  const resolvedType = resolveUploadMimeType(file);
  if (resolvedType === file.type) {
    return file;
  }
  return new File([file], file.name, {
    type: resolvedType,
    lastModified: file.lastModified,
  });
}

export function isVideoLikeMedia(media?: MediaLike | null): boolean {
  if (!media) return false;
  const type = (media.type || "").toLowerCase();
  const mimeType = (media.mimeType || "").toLowerCase();
  const mime = (media.mime || "").toLowerCase();
  return (
    type === "video" ||
    type.startsWith("video/") ||
    mimeType.startsWith("video/") ||
    mime.startsWith("video/")
  );
}
