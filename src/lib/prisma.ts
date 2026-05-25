import { PrismaClient } from "@prisma/client/edge";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getPrisma(): PrismaClient {
  const { env } = getCloudflareContext();
  const adapter = new PrismaD1((env as any).DB);
  return new PrismaClient({ adapter });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
