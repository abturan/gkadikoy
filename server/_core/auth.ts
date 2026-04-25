import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { users, User } from "../../drizzle/schema";
import { getDb } from "../db";
import { ENV } from "./env";

const BCRYPT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const lowered = email.toLowerCase().trim();
  const result = await db.select().from(users).where(eq(users.email, lowered)).limit(1);
  return result[0];
}

export async function loginWithPassword(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash || !user.active) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

/**
 * Seed an initial admin user if ADMIN_EMAIL/ADMIN_PASSWORD env is set
 * and no admin exists yet in the database.
 */
export async function seedAdminUser(): Promise<void> {
  if (!ENV.adminPassword) {
    console.warn("[Auth] ADMIN_PASSWORD not set — admin seed skipped.");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Auth] DB unavailable — admin seed skipped.");
    return;
  }

  try {
    const existing = await findUserByEmail(ENV.adminEmail);
    if (existing) {
      // Admin already exists — leave it alone
      return;
    }

    const passwordHash = await hashPassword(ENV.adminPassword);
    const openId = `local_${nanoid(12)}`;

    await db.insert(users).values({
      openId,
      email: ENV.adminEmail.toLowerCase().trim(),
      name: "Yönetici",
      role: "admin",
      loginMethod: "password",
      passwordHash,
      active: true,
    });

    console.log(`[Auth] Admin seeded: ${ENV.adminEmail}`);
  } catch (err) {
    console.error("[Auth] Admin seed failed:", err);
  }
}

export function isStaffRole(role: string): boolean {
  return role === "admin" || role === "editor" || role === "moderator";
}
