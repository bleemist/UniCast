import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession, hasPermission } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        author: { select: { id: true, name: true, role: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "news")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { title, excerpt, content, coverImage, categoryId, isFeatured, isPublished, isArchived } = body;

    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(excerpt && { excerpt: excerpt.trim() }),
        ...(content && { content: content.trim() }),
        ...(coverImage && { coverImage: coverImage.trim() }),
        ...(categoryId && { categoryId }),
        ...(typeof isFeatured === "boolean" && { isFeatured }),
        ...(typeof isPublished === "boolean" && { isPublished }),
        ...(typeof isArchived === "boolean" && { isArchived }),
      },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "UPDATE_ARTICLE",
      resource: "Article",
      details: { articleId: updated.id, title: updated.title, isPublished: updated.isPublished },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.role, "news")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await prisma.article.update({
      where: { id: params.id },
      data: { isArchived: true, isPublished: false },
    });

    await createAuditLog({
      userId: session.id,
      userEmail: session.email,
      action: "ARCHIVE_ARTICLE",
      resource: "Article",
      details: { articleId: existing.id, title: existing.title },
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, message: "Article archived" });
  } catch (error) {
    console.error("Error archiving article:", error);
    return NextResponse.json({ error: "Failed to archive article" }, { status: 500 });
  }
}
