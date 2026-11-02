import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { path: segments } = await params;
  if (segments.some((segment) => segment.includes("..") || segment.includes("/") || segment.includes("\\"))) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, ...segments);
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  try {
    await stat(filePath);
    const buffer = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXT[extension] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
