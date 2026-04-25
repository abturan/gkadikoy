import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { ENV } from "./env";

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

/**
 * Accept a base64 data URL, write to local storage, return public URL.
 */
export async function saveUpload(
  dataUrl: string,
  opts?: { folder?: string; maxBytes?: number }
): Promise<{ url: string; path: string } | null> {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  const mime = match[1];
  const base64 = match[2];

  if (!ALLOWED_MIMES.has(mime)) {
    throw new Error(`Desteklenmeyen dosya türü: ${mime}`);
  }

  const buffer = Buffer.from(base64, "base64");
  const maxBytes = opts?.maxBytes ?? 10 * 1024 * 1024; // 10 MB default
  if (buffer.length > maxBytes) {
    throw new Error(`Dosya çok büyük (max ${Math.round(maxBytes / 1024 / 1024)}MB).`);
  }

  const ext = EXT_MAP[mime] ?? "bin";
  const folder = opts?.folder ?? "general";
  const filename = `${nanoid(16)}.${ext}`;

  const baseDir = path.resolve(process.cwd(), ENV.uploadsDir);
  const targetDir = path.join(baseDir, folder);
  await fs.mkdir(targetDir, { recursive: true });

  const filepath = path.join(targetDir, filename);
  await fs.writeFile(filepath, buffer);

  // Public URL served by express static middleware
  const url = `/uploads/${folder}/${filename}`;
  return { url, path: filepath };
}

export async function ensureUploadsDir(): Promise<void> {
  const baseDir = path.resolve(process.cwd(), ENV.uploadsDir);
  await fs.mkdir(baseDir, { recursive: true });
  console.log(`[Upload] Uploads dir: ${baseDir}`);
}
