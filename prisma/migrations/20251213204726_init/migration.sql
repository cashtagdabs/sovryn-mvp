/*
  Warnings:

  - You are about to drop the column `lastPrimexAccess` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `primexUsageCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sovereignAccess` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ConversationLike" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationLike_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'PRIMEX',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("createdAt", "id", "isArchived", "isPinned", "model", "title", "updatedAt", "userId") SELECT "createdAt", "id", "isArchived", "isPinned", "model", "title", "updatedAt", "userId" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE UNIQUE INDEX "Conversation_shareId_key" ON "Conversation"("shareId");
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");
CREATE INDEX "Conversation_isPublic_idx" ON "Conversation"("isPublic");
CREATE INDEX "Conversation_shareId_idx" ON "Conversation"("shareId");
CREATE TABLE "new_SavedPrompt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavedPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedPrompt" ("category", "createdAt", "description", "id", "isPublic", "prompt", "tags", "title", "updatedAt", "usageCount", "userId") SELECT "category", "createdAt", "description", "id", "isPublic", "prompt", "tags", "title", "updatedAt", "usageCount", "userId" FROM "SavedPrompt";
DROP TABLE "SavedPrompt";
ALTER TABLE "new_SavedPrompt" RENAME TO "SavedPrompt";
CREATE INDEX "SavedPrompt_userId_idx" ON "SavedPrompt"("userId");
CREATE INDEX "SavedPrompt_isPublic_idx" ON "SavedPrompt"("isPublic");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "github" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "clerkId", "createdAt", "email", "id", "name", "updatedAt") SELECT "avatarUrl", "clerkId", "createdAt", "email", "id", "name", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ConversationLike_conversationId_idx" ON "ConversationLike"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationLike_userId_conversationId_key" ON "ConversationLike"("userId", "conversationId");
