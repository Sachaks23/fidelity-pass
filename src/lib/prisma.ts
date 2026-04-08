import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Chemin absolu vers la base de données — évite les problèmes de répertoire relatif
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  let dbUrl: string;
  if (rawUrl.startsWith("file:") && !rawUrl.startsWith("file:///")) {
    // Chemin relatif → on le résout en absolu depuis la racine du projet
    const relativePath = rawUrl.replace("file:", "");
    const absolutePath = path.resolve(process.cwd(), relativePath);
    dbUrl = `file://${absolutePath}`;
  } else {
    dbUrl = rawUrl;
  }

  const adapter = new PrismaLibSql({ url: dbUrl });
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
