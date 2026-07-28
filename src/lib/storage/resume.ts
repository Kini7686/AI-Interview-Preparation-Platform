import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "resumes");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type StoredResumeFile = {
  storageKey: string;
  fileName: string;
  mimeType: string;
};

export async function storeResumeFile(
  userId: string,
  file: File,
): Promise<StoredResumeFile> {
  if (file.size > MAX_BYTES) {
    throw new Error("File must be 5 MB or smaller");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only PDF or DOCX files are allowed");
  }

  await mkdir(UPLOAD_ROOT, { recursive: true });
  const ext = file.name.toLowerCase().endsWith(".docx") ? "docx" : "pdf";
  const storageKey = `${userId}/${randomUUID()}.${ext}`;
  const abs = path.join(UPLOAD_ROOT, storageKey);
  await mkdir(path.dirname(abs), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buffer);

  return {
    storageKey,
    fileName: file.name,
    mimeType: file.type,
  };
}

/** Best-effort text extract for MVP (PDF binary may be noisy; user can edit summary). */
export async function extractResumeText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/pdf") {
    const raw = buffer.toString("latin1");
    const matches = raw.match(/\((?:\\\)|[^)]){4,}\)/g) ?? [];
    const text = matches
      .map((m) => m.slice(1, -1).replace(/\\n/g, "\n").replace(/\\\)/g, ")"))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 8000);
  }
  // DOCX is zip+xml; surface a placeholder so user edits summary
  return "";
}
