import { NextRequest, NextResponse } from "next/server";

const ADMIN_SALT = "v6-admin-session-2026";

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return buf;
}

async function isValidAdminToken(adminKey: string, token: string): Promise<boolean> {
  if (token.length !== 64) return false;
  const encoder = new TextEncoder();
  try {
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(adminKey),
      { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    return await crypto.subtle.verify("HMAC", key, hexToArrayBuffer(token), encoder.encode(ADMIN_SALT));
  } catch {
    return false;
  }
}

// Lightweight member token check — structural + expiry only.
// Full HMAC verification happens in getMemberSession() server action.
function isMemberTokenStructurallyValid(token: string): boolean {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [_userId, expStr, sigHex] = parts;
    const exp = parseInt(expStr);
    if (isNaN(exp) || Date.now() / 1000 > exp) return false;
    if (sigHex.length !== 64) return false; // SHA-256 hex = 64 chars
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const adminKey = process.env.ADMIN_OMNI_KEY ?? "";
    if (!adminKey) return NextResponse.next();

    const session = request.cookies.get("v6_admin_session");
    if (!session?.value) return NextResponse.next();

    const valid = await isValidAdminToken(adminKey, session.value);
    if (!valid) {
      const res = NextResponse.redirect(new URL("/admin", request.url));
      res.cookies.delete("v6_admin_session");
      return res;
    }
    return NextResponse.next();
  }

  // ── Member protection ─────────────────────────────────────────────────────
  if (pathname.startsWith("/member")) {
    const session = request.cookies.get("v6_member_session");
    if (!session?.value || !isMemberTokenStructurallyValid(session.value)) {
      const res = NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));
      res.cookies.delete("v6_member_session");
      res.cookies.delete("v6_member_name");
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/member", "/member/:path*"],
};
