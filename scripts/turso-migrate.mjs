import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://fidelity-pass-sachaks23.aws-eu-west-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiJmYWIzNWNiMS1jMzk5LTQyYzYtYjZmYS04NzM1NmFlNzYxZmIiLCJpYXQiOjE3NzU2NjMzMzIsInJpZCI6IjA0NWY5OTRmLTE3MWQtNDJhNC05YWE0LTU4MTYxNmU4NTZmYiJ9.brpcMMz4T4B0EaS_sS_BVpxe7OnBNVHBWLuaCWqpTBOCFTNS_mB7AnmfBkff3PQQ6HdqxUk0clNXhcICRJ-yCQ",
});

const statements = [
  `CREATE TABLE IF NOT EXISTS "Account" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL, "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT, "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT, CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Session" ("id" TEXT NOT NULL PRIMARY KEY, "sessionToken" TEXT NOT NULL, "userId" TEXT NOT NULL, "expires" DATETIME NOT NULL, CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "VerificationToken" ("identifier" TEXT NOT NULL, "token" TEXT NOT NULL, "expires" DATETIME NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "emailVerified" DATETIME, "name" TEXT, "image" TEXT, "role" TEXT NOT NULL DEFAULT 'CUSTOMER', "passwordHash" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "Business" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "category" TEXT NOT NULL, "address" TEXT, "phone" TEXT, "logoUrl" TEXT, "cardBgColor" TEXT NOT NULL DEFAULT '#1a1a2e', "cardFgColor" TEXT NOT NULL DEFAULT '#ffffff', "cardAccentColor" TEXT NOT NULL DEFAULT '#e94560', "stampsRequired" INTEGER NOT NULL DEFAULT 10, "rewardLabel" TEXT NOT NULL DEFAULT 'Récompense offerte', "description" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Customer" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "phone" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "LoyaltyCard" ("id" TEXT NOT NULL PRIMARY KEY, "businessId" TEXT NOT NULL, "customerId" TEXT NOT NULL, "serialNumber" TEXT NOT NULL, "stampCount" INTEGER NOT NULL DEFAULT 0, "totalStamps" INTEGER NOT NULL DEFAULT 0, "isActive" INTEGER NOT NULL DEFAULT 1, "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "LoyaltyCard_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "LoyaltyCard_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "Transaction" ("id" TEXT NOT NULL PRIMARY KEY, "cardId" TEXT NOT NULL, "type" TEXT NOT NULL, "stampsDelta" INTEGER NOT NULL DEFAULT 1, "note" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "LoyaltyCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "ScanEvent" ("id" TEXT NOT NULL PRIMARY KEY, "businessId" TEXT NOT NULL, "cardId" TEXT NOT NULL, "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ScanEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "ScanEvent_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "LoyaltyCard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "PushSubscription" ("id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "endpoint" TEXT NOT NULL, "p256dh" TEXT NOT NULL, "auth" TEXT NOT NULL, "platform" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PushSubscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "PushNotification" ("id" TEXT NOT NULL PRIMARY KEY, "businessId" TEXT NOT NULL, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "status" TEXT NOT NULL DEFAULT 'PENDING', "sentCount" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "PushNotification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "EmailNotification" ("id" TEXT NOT NULL PRIMARY KEY, "businessId" TEXT NOT NULL, "subject" TEXT NOT NULL, "body" TEXT NOT NULL, "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "sentCount" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'SENT', CONSTRAINT "EmailNotification_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "PasswordResetToken" ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "token" TEXT NOT NULL, "expires" DATETIME NOT NULL, "used" INTEGER NOT NULL DEFAULT 0, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  // Indexes
  `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Business_userId_key" ON "Business"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Business_slug_key" ON "Business"("slug")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Customer_userId_key" ON "Customer"("userId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyCard_serialNumber_key" ON "LoyaltyCard"("serialNumber")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyCard_businessId_customerId_key" ON "LoyaltyCard"("businessId", "customerId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token")`,
];

console.log(`Executing ${statements.length} statements on Turso...`);
let ok = 0, skip = 0, fail = 0;

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    ok++;
    process.stdout.write(".");
  } catch (err) {
    if (err.message?.includes("already exists")) {
      skip++;
      process.stdout.write("s");
    } else {
      fail++;
      console.error(`\n❌ ${err.message}`);
      console.error(`   SQL: ${stmt.substring(0, 80)}...`);
    }
  }
}

console.log(`\n\n✅ Done — ${ok} created, ${skip} skipped, ${fail} failed`);
client.close();
