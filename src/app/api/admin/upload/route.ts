import sharp from "sharp";
import { prisma } from "@/lib/db";
import { apiUser, guardOrigin, jsonError, jsonOk, serverError } from "@/lib/http";
import { saveFile } from "@/lib/storage";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const IMAGE_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 100 * 1024 * 1024;

function magic(buffer: Buffer, mime: string) {
  if (mime === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mime === "image/webp") {
    return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  }
  if (mime === "image/avif") return buffer.subarray(4, 12).toString().includes("ftyp");
  if (mime === "video/mp4") return buffer.subarray(4, 8).toString() === "ftyp";
  if (mime === "video/webm") return buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;
  return false;
}

export async function POST(request: Request) {
  const originError = guardOrigin(request);
  if (originError) return originError;

  try {
    const user = await apiUser();
    if (!user) return jsonError("UNAUTHORIZED", "请先登录。", 401);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("VALIDATION_ERROR", "请选择要上传的文件。", 422, { file: "请选择文件" });
    }

    const mime = file.type || "application/octet-stream";
    if (mime === "image/svg+xml") {
      return jsonError("UNSUPPORTED_MEDIA_TYPE", "不支持 SVG，请上传 JPG、PNG、WebP 或 AVIF。", 415);
    }
    const isImage = IMAGE_TYPES.has(mime);
    const isVideo = VIDEO_TYPES.has(mime);
    if (!isImage && !isVideo) {
      return jsonError("UNSUPPORTED_MEDIA_TYPE", "只支持 JPG、PNG、WebP、AVIF 图片和 MP4、WebM 视频。", 415);
    }

    const limit = isImage ? IMAGE_LIMIT : VIDEO_LIMIT;
    if (file.size > limit) {
      return jsonError(
        "PAYLOAD_TOO_LARGE",
        isImage ? "图片不能超过 10 MB。" : "视频不能超过 100 MB。",
        413,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!magic(buffer, mime)) {
      return jsonError("UNSUPPORTED_MEDIA_TYPE", "文件内容与格式不符。", 415);
    }

    let url = "";
    let width: number | null = null;
    let height: number | null = null;
    let storedMime = mime;
    let size = file.size;

    if (isImage) {
      const result = await sharp(buffer)
        .rotate()
        .webp({ quality: 82, effort: 4 })
        .toBuffer({ resolveWithObject: true });
      const saved = await saveFile(result.data, "webp");
      url = saved.url;
      width = result.info.width;
      height = result.info.height;
      storedMime = "image/webp";
      size = result.data.byteLength;
    } else {
      const extension = mime === "video/mp4" ? "mp4" : "webm";
      const saved = await saveFile(buffer, extension);
      url = saved.url;
    }

    const media = await prisma.media.create({
      data: {
        url,
        storageKey: url.replace(/^\/uploads\//, ""),
        originalName: file.name.slice(0, 120) || "upload",
        mime: storedMime,
        size,
        width,
        height,
        createdBy: user.id,
      },
    });

    return jsonOk({ id: media.id, url, width, height, size, mime: storedMime }, 201);
  } catch (error) {
    return serverError(error);
  }
}
