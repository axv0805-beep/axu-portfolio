import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "data", "uploads");

export function uploadDir(now = new Date()) {
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return { year, month, absolute: path.join(root, year, month) };
}

export async function saveFile(buffer: Buffer, extension: string) {
  const { year, month, absolute } = uploadDir();
  await mkdir(absolute, { recursive: true });
  const key = `${year}/${month}/${crypto.randomUUID()}.${extension}`;
  await writeFile(path.join(root, key), buffer);
  return { storageKey: key, url: `/uploads/${key}` };
}

export function absolutePath(storageKey: string) {
  return path.join(root, storageKey);
}

export async function removeFile(storageKey: string) {
  try {
    await unlink(absolutePath(storageKey));
  } catch {
    // 文件可能已经被手动删除；数据库记录仍然要清理。
  }
}
