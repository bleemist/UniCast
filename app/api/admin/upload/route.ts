import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/aac",
  "audio/x-m4a",
  "audio/m4a",
]);

const EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
  "audio/aac": ".aac",
  "audio/x-m4a": ".m4a",
  "audio/m4a": ".m4a",
};

const MAX_IMAGE_SIZE = 6 * 1024 * 1024; // 6 MB
const MAX_AUDIO_SIZE = 60 * 1024 * 1024; // 60 MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIp(req);
    // Rate limit: 20 uploads per 10 minutes per IP
    const limiter = rateLimit(`upload_${ip}`, {
      windowMs: 10 * 60 * 1000,
      maxRequests: 20,
    });
    if (!limiter.isAllowed) {
      return NextResponse.json(
        { error: "Upload rate limit reached. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaType = formData.get("mediaType") as string | null; // "image" | "audio"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type?.toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.has(mimeType);
    const isAudio = ALLOWED_AUDIO_TYPES.has(mimeType);

    if (!isImage && !isAudio) {
      return NextResponse.json(
        {
          error:
            "Unsupported file format. Allowed formats: JPEG, PNG, WebP, GIF for images; MP3, WAV, OGG, M4A for audio.",
        },
        { status: 400 }
      );
    }

    if (mediaType === "image" && !isImage) {
      return NextResponse.json(
        { error: "Expected an image file, but received non-image format." },
        { status: 400 }
      );
    }

    if (mediaType === "audio" && !isAudio) {
      return NextResponse.json(
        { error: "Expected an audio file, but received non-audio format." },
        { status: 400 }
      );
    }

    const maxAllowed = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxAllowed) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${
            isAudio ? "60MB for audio" : "6MB for images"
          }.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic number validation for extra security (prevent disguised executables)
    if (isImage) {
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47;
      const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
      const isWebp =
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";

      if (!isJpeg && !isPng && !isGif && !isWebp) {
        return NextResponse.json(
          { error: "Invalid image binary content." },
          { status: 400 }
        );
      }
    }

    const subDir = isAudio ? "audio" : "images";
    const extension = EXTENSION_MAP[mimeType] || (isAudio ? ".mp3" : ".jpg");
    const randomHex = crypto.randomBytes(16).toString("hex");
    const safeFilename = `${Date.now()}_${randomHex}${extension}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
    await mkdir(uploadDir, { recursive: true });

    const destinationPath = path.join(uploadDir, safeFilename);
    await writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${subDir}/${safeFilename}`;

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "UPLOAD_FILE",
      resource: isAudio ? "PodcastAudio" : "MediaImage",
      details: {
        filename: safeFilename,
        size: file.size,
        mimeType,
        url: publicUrl,
      },
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
      mimeType,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}
