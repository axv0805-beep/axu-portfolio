import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { getCurrentUser } from "./auth";

export function requestId() {
  return crypto.randomUUID();
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(
    { ok: true, data },
    { status, headers: { "X-Request-Id": requestId() } },
  );
}

export function jsonError(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string>,
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(fields ? { fields } : {}) } },
    { status, headers: { "X-Request-Id": requestId() } },
  );
}

export function zodError(error: ZodError) {
  const flat = error.flatten().fieldErrors;
  const fields: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages && messages.length > 0) fields[key] = messages[0] as string;
  }
  return jsonError("VALIDATION_ERROR", "提交的内容有误，请检查标出的字段。", 422, fields);
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function guardOrigin(request: Request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return null;
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const expected = process.env.APP_ORIGIN ?? "http://localhost:3000";
  if (origin !== expected) {
    return jsonError("FORBIDDEN", "请求来源不可信。", 403);
  }
  return null;
}

export async function apiUser() {
  return getCurrentUser();
}

export function serverError(error: unknown) {
  console.error("[api]", error);
  return jsonError("INTERNAL_ERROR", "服务器出了点问题，请稍后重试。", 500);
}

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
