import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  let dbUrl: string;
  if (rawUrl.startsWith("file:") && !rawUrl.startsWith("file:///")) {
    // Local SQLite — chemin relatif → absolu
    const relativePath = rawUrl.replace("file:", "");
    const absolutePath = path.resolve(process.cwd(), relativePath);
    dbUrl = `file://${absolutePath}`;
  } else {
    dbUrl = rawUrl;
  }

  const adapter = new PrismaLibSql({
    url: dbUrl,
    ...(authToken ? { authToken } : {}),
  });

  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
