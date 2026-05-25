import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "edge";

export async function GET() {
  try {
    const prisma = getPrisma();
    const count = await prisma.artifact.count();
    return NextResponse.json({ ok: true, count });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message, stack: err?.stack }, { status: 500 });
  }
}
