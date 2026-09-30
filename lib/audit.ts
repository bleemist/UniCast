import prisma from "@/lib/prisma";

export interface LogAuditOptions {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  resource: string;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
}

export async function createAuditLog(options: LogAuditOptions) {
  try {
    const detailsStr =
      options.details && typeof options.details === "object"
        ? JSON.stringify(options.details)
        : options.details || null;

    return await prisma.auditLog.create({
      data: {
        userId: options.userId || null,
        userEmail: options.userEmail || null,
        action: options.action,
        resource: options.resource,
        details: detailsStr,
        ipAddress: options.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
