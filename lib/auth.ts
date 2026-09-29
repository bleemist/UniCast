import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserSession, Role } from "@/types";
import { COOKIE_NAME } from "./constants";

export { COOKIE_NAME };

const JWT_SECRET =
  process.env.JWT_SECRET || "unicast-super-secure-production-jwt-key-2026-uganda";

export function signToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function hasPermission(
  userRole: Role,
  actionDomain: "universities" | "programmes" | "news" | "users" | "settings" | "broadcast" | "analytics"
): boolean {
  if (userRole === "SUPER_ADMIN") return true;

  switch (actionDomain) {
    case "universities":
    case "programmes":
    case "broadcast":
      return userRole === "RADIO_ADMIN";
    case "analytics":
      return userRole === "RADIO_ADMIN" || userRole === "EDITOR";
    case "news":
      return userRole === "RADIO_ADMIN" || userRole === "EDITOR";
    case "users":
    case "settings":
      return false;
    default:
      return false;
  }
}
