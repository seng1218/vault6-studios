import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    const { env } = getCloudflareContext();
    const adapter = new PrismaD1((env as any).DB);
    const client = new PrismaClient({ adapter });
    return (client as any)[prop as string];
  },
});
