const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Uint8Array {
  const clean = input.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
  const bits = clean
    .split("")
    .map(c => {
      const idx = B32.indexOf(c);
      if (idx < 0) throw new Error(`Invalid base32 char: ${c}`);
      return idx.toString(2).padStart(5, "0");
    })
    .join("");
  const byteCount = Math.floor(bits.length / 8);
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

function base32Encode(bytes: Uint8Array): string {
  let bits = Array.from(bytes)
    .map(b => b.toString(2).padStart(8, "0"))
    .join("");
  while (bits.length % 5 !== 0) bits += "0";
  let out = "";
  for (let i = 0; i < bits.length; i += 5) {
    out += B32[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

export function generateTOTPSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

export function getOtpAuthUri(secret: string, issuer = "Vault6Admin"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:Admin?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

export async function verifyTOTP(secret: string, token: string): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) return false;

  const keyBytes = base32Decode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const timeStep = Math.floor(Date.now() / 1000 / 30);

  for (const drift of [-1, 0, 1]) {
    const counter = timeStep + drift;
    const counterBuf = new ArrayBuffer(8);
    const view = new DataView(counterBuf);
    view.setUint32(0, Math.floor(counter / 2 ** 32), false);
    view.setUint32(4, counter >>> 0, false);

    const sig = await crypto.subtle.sign("HMAC", cryptoKey, counterBuf);
    const hmac = new Uint8Array(sig);
    const trunc = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[trunc] & 0x7f) << 24) |
      ((hmac[trunc + 1] & 0xff) << 16) |
      ((hmac[trunc + 2] & 0xff) << 8) |
      (hmac[trunc + 3] & 0xff);

    if ((code % 1_000_000).toString().padStart(6, "0") === token) return true;
  }

  return false;
}
