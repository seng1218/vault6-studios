"use server";

import { cookies } from "next/headers";

const ADMIN_KEY = process.env.ADMIN_OMNI_KEY || "V6-SUPER-ADMIN-2026";

export async function verifyOmniKey(key: string) {
  if (key === ADMIN_KEY) {
    const cookieStore = await cookies();
    cookieStore.set("v6_admin_session", "authorized", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "ACCESS DENIED: INVALID OMNI-KEY" };
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("v6_admin_session");
  return session?.value === "authorized";
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("v6_admin_session");
}
