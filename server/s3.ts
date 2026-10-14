import crypto from "crypto";
import path from "path";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_MEDIA_BYTES = 100 * 1024 * 1024;
const mediaTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"]);

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for S3 storage`);
  return value;
}

function client() {
  return new S3Client({
    region: required("COMMUNITY_PARTNER_AWS_REGION"),
    credentials: {
      accessKeyId: required("COMMUNITY_PARTNER_AWS_ACCESS_KEY_ID"),
      secretAccessKey: required("COMMUNITY_PARTNER_AWS_SECRET_ACCESS_KEY"),
    },
  });
}

function bucket() { return required("COMMUNITY_PARTNER_S3_BUCKET"); }

function safeFilename(filename: string) {
  const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return base || "upload";
}

export type UploadIntent = { key: string; uploadUrl: string; expiresAt: string };

export function validateMediaUpload(input: { filename?: unknown; contentType?: unknown; byteSize?: unknown }) {
  const filename = typeof input.filename === "string" ? input.filename.trim() : "";
  const contentType = typeof input.contentType === "string" ? input.contentType.toLowerCase().trim() : "";
  const byteSize = typeof input.byteSize === "number" ? input.byteSize : Number(input.byteSize);
  if (!filename || filename.length > 255) throw new Error("A valid file name is required.");
  if (!mediaTypes.has(contentType)) throw new Error("Allowed media types are JPG/JPEG, PNG, WebP, PDF, and MP4.");
  if (!Number.isSafeInteger(byteSize) || byteSize <= 0 || byteSize > MAX_MEDIA_BYTES) throw new Error("Media files must be between 1 byte and 100 MB.");
  return { filename: safeFilename(filename), contentType, byteSize };
}

export async function createMediaUploadIntent(eventId: number, input: { filename?: unknown; contentType?: unknown; byteSize?: unknown }): Promise<UploadIntent & { filename: string; contentType: string; byteSize: number }> {
  const metadata = validateMediaUpload(input);
  const key = `event-media/${eventId}/${crypto.randomUUID()}-${metadata.filename}`;
  const uploadUrl = await getSignedUrl(client(), new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: metadata.contentType, ContentLength: metadata.byteSize }), { expiresIn: 300 });
  return { ...metadata, key, uploadUrl, expiresAt: new Date(Date.now() + 300_000).toISOString() };
}

export async function verifyMediaObject(key: string, expected: { contentType: string; byteSize: number }) {
  const object = await client().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
  if (object.ContentType !== expected.contentType || object.ContentLength !== expected.byteSize) throw new Error("Uploaded object did not match the authorized file metadata.");
}

export async function createMediaDownloadUrl(key: string) {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn: 300 });
}
