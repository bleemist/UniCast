import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserSession, Role } from "@/types";
import { COOKIE_NAME } from "./constants";

export { COOKIE_NAME };

const JWT_SECRET =
  process.env.JWT_SECRET || "kyambogo-radio-super-secure-production-jwt-key-2026-uganda";


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

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    SUPER_ADMIN: 4,
    RADIO_ADMIN: 3,
    PRESENTER: 2,
    EDITOR: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
