"use server";

import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const SESSION_SECRET = process.env.MEMBER_JWT_SECRET ?? "v6-member-fallback-secret-change-in-prod";
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

// ─── Password hashing — PBKDF2 via Web Crypto (edge-compatible) ───────────────

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 50000, hash: "SHA-256" },
    key, 256
  );
  const hex = (b: Uint8Array) => Array.from(b).map(n => n.toString(16).padStart(2, "0")).join("");
  return `${hex(salt)}:${hex(new Uint8Array(bits))}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, _hashHex] = stored.split(":");
    const salt = new Uint8Array((saltHex.match(/.{2}/g) ?? []).map(b => parseInt(b, 16)));
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 50000, hash: "SHA-256" },
      key, 256
    );
    const newHash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
    return newHash === _hashHex;
  } catch {
    return false;
  }
}

// ─── Session token — HMAC-SHA256 signed, constant-time verify ────────────────
// Format: `${userId}:${exp}:${hmacHex}`

async function makeToken(userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const payload = `${userId}:${exp}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `${payload}:${sigHex}`;
}

async function parseToken(token: string): Promise<{ userId: string } | null> {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return null;
    const [userId, expStr, sigHex] = parts;
    const exp = parseInt(expStr);
    if (isNaN(exp) || Date.now() / 1000 > exp) return null;

    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const sigBytes = new Uint8Array((sigHex.match(/.{2}/g) ?? []).map(b => parseInt(b, 16)));
    const valid = await crypto.subtle.verify(
      "HMAC", key, sigBytes, new TextEncoder().encode(`${userId}:${exp}`)
    );
    return valid ? { userId } : null;
  } catch {
    return null;
  }
}

function setCookies(cookieStore: Awaited<ReturnType<typeof cookies>>, token: string, name: string) {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_TTL,
    path: "/",
  };
  cookieStore.set("v6_member_session", token, opts);
  // Non-httpOnly: client-side header reads this to show logged-in state
  cookieStore.set("v6_member_name", encodeURIComponent(name), {
    ...opts,
    httpOnly: false,
  });
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function registerMember(data: { name: string; email: string; password: string }) {
  try {
    if (!data.name.trim() || !data.email.trim() || data.password.length < 6) {
      return { success: false, error: "All fields required. Password min 6 chars." };
    }
    const db = await getPrisma();
    const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) return { success: false, error: "Email already registered." };

    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: { email: data.email.toLowerCase().trim(), name: data.name.trim(), passwordHash },
    });

    const cookieStore = await cookies();
    setCookies(cookieStore, await makeToken(user.id), user.name);
    return { success: true };
  } catch (err) {
    console.error("Register error:", err);
    return { success: false, error: "Registration failed. Try again." };
  }
}

export async function loginMember(data: { email: string; password: string }) {
  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (!user) return { success: false, error: "Invalid email or password." };

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) return { success: false, error: "Invalid email or password." };

    const cookieStore = await cookies();
    setCookies(cookieStore, await makeToken(user.id), user.name);
    return { success: true };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Login failed. Try again." };
  }
}

export async function logoutMember() {
  const cookieStore = await cookies();
  cookieStore.delete("v6_member_session");
  cookieStore.delete("v6_member_name");
}

export async function getMemberSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("v6_member_session")?.value;
    if (!token) return null;

    const parsed = await parseToken(token);
    if (!parsed) return null;

    const db = await getPrisma();
    return db.user.findUnique({
      where: { id: parsed.userId },
      select: { 
        id: true, email: true, name: true, phone: true, address: true, 
        city: true, state: true, zip: true, country: true, 
        isPublicProfile: true, operativeName: true,
        createdAt: true 
      },
    });
  } catch {
    return null;
  }
}

// ─── Member data actions ──────────────────────────────────────────────────────

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("v6_member_session")?.value;
  if (!token) return null;
  const parsed = await parseToken(token);
  return parsed?.userId ?? null;
}

export async function getMemberOrders() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Not authenticated." };

    const db = await getPrisma();
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) return { success: false, error: "User not found." };

    const orders = await db.order.findMany({
      where: { OR: [{ userId }, { customerEmail: user.email }] },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (err) {
    console.error("getMemberOrders error:", err);
    return { success: false, error: "Failed to fetch orders." };
  }
}

export async function getMemberWishlist() {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Not authenticated." };

    const db = await getPrisma();
    const items = await db.wishlist.findMany({
      where: { userId },
      include: { artifact: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: items };
  } catch (err) {
    console.error("getMemberWishlist error:", err);
    return { success: false, error: "Failed to fetch wishlist." };
  }
}

export async function toggleWishlist(artifactId: string) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Not authenticated." };

    const db = await getPrisma();
    const existing = await db.wishlist.findUnique({
      where: { userId_artifactId: { userId, artifactId } },
    });

    if (existing) {
      await db.wishlist.delete({ where: { id: existing.id } });
      return { success: true, added: false };
    }
    await db.wishlist.create({ data: { userId, artifactId } });
    return { success: true, added: true };
  } catch (err) {
    console.error("toggleWishlist error:", err);
    return { success: false, error: "Failed to update watchlist." };
  }
}

export async function updateMemberProfile(data: {
  phone?: string; address?: string; city?: string; state?: string; zip?: string; country?: string;
  isPublicProfile?: boolean; operativeName?: string;
}) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return { success: false, error: "Not authenticated." };

    const db = await getPrisma();
    await db.user.update({ where: { id: userId }, data });
    revalidatePath("/member");
    revalidatePath("/members");
    return { success: true };
  } catch (err) {
    console.error("updateMemberProfile error:", err);
    return { success: false, error: "Failed to update profile." };
  }
}

export async function fetchAllMembers() {
  try {
    const db = await getPrisma();
    const users = await db.user.findMany({
      where: { isPublicProfile: true },
      select: {
        id: true,
        email: false, // PDPA: Do not leak emails
        name: true,
        operativeName: true,
        createdAt: true,
        orders: {
          where: { status: { in: ["PAID", "SHIPPED", "COMPLETED"] } },
          include: { items: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: users };
  } catch (err) {
    console.error("fetchAllMembers error:", err);
    return { success: false, error: "Failed to fetch operatives." };
  }
}

export async function fetchMemberById(id: string) {
  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({
      where: { id, isPublicProfile: true },
      select: {
        id: true,
        name: true,
        operativeName: true,
        createdAt: true,
        orders: {
          where: { status: { in: ["PAID", "SHIPPED", "COMPLETED"] } },
          include: { items: true }
        }
      }
    });
    if (!user) return { success: false, error: "Operative dossier is restricted or not found." };
    return { success: true, data: user };
  } catch (err) {
    console.error("fetchMemberById error:", err);
    return { success: false, error: "Failed to fetch operative dossier." };
  }
}

