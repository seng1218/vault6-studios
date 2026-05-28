"use server";

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { verifyTOTP, generateTOTPSecret, getOtpAuthUri } from "@/lib/totp";

const ADMIN_KEY = process.env.ADMIN_OMNI_KEY ?? "";
const SESSION_SALT = "v6-admin-session-2026";

function makeToken(): string {
  return createHmac("sha256", ADMIN_KEY).update(SESSION_SALT).digest("hex");
}

async function readTOTPSecret(): Promise<string | null> {
  try {
    const db = await getPrisma();
    const row = await db.siteSetting.findUnique({ where: { key: "totp_secret" } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function isTOTPConfigured(): Promise<boolean> {
  return (await readTOTPSecret()) !== null;
}

export async function setupTOTP(): Promise<{ secret: string; uri: string }> {
  const secret = generateTOTPSecret();
  const db = await getPrisma();
  await db.siteSetting.upsert({
    where: { key: "totp_secret" },
    update: { value: secret },
    create: { key: "totp_secret", value: secret },
  });
  return { secret, uri: getOtpAuthUri(secret) };
}

export async function disableTOTP(): Promise<void> {
  try {
    const db = await getPrisma();
    await db.siteSetting.delete({ where: { key: "totp_secret" } });
  } catch {}
}

export async function verifyOmniKey(key: string, totpCode?: string) {
  if (!ADMIN_KEY) {
    return { success: false, error: "ADMIN_OMNI_KEY not configured on server." };
  }
  if (key !== ADMIN_KEY) {
    return { success: false, error: "ACCESS DENIED: INVALID OMNI-KEY" };
  }

  const totpSecret = await readTOTPSecret();
  if (totpSecret) {
    if (!totpCode) {
      return { success: false, requireTOTP: true, error: "Authenticator code required." };
    }
    const valid = await verifyTOTP(totpSecret, totpCode);
    if (!valid) {
      return { success: false, error: "INVALID AUTHENTICATOR CODE" };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("v6_admin_session", makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 2,
    path: "/",
  });
  return { success: true };
}

export async function checkAdminAuth() {
  if (!ADMIN_KEY) return false;
  const cookieStore = await cookies();
  const session = cookieStore.get("v6_admin_session");
  if (!session?.value) return false;
  return session.value === makeToken();
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("v6_admin_session");
}
