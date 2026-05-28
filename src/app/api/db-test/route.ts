import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

export async function GET() {
  const diagnostics: Record<string, any> = {};
  try {
    diagnostics.step = "getCloudflareContext";
    const { env } = await getCloudflareContext({ async: true });
    diagnostics.hasEnv = !!env;
    diagnostics.hasDB = !!(env as any).DB;
    diagnostics.dbType = typeof (env as any).DB;

    diagnostics.step = "PrismaD1";
    const adapter = new PrismaD1((env as any).DB);

    diagnostics.step = "PrismaClient";
    const prisma = new PrismaClient({ adapter });

    diagnostics.step = "query";
    const count = await prisma.artifact.count();
    return NextResponse.json({ ok: true, count, diagnostics });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      failedAt: diagnostics.step,
      diagnostics,
      error: err?.message,
      cause: err?.cause?.message,
    }, { status: 500 });
  }
}
