-- Add PRIMEX-related fields to User model
-- This migration adds sovereign access tracking

-- Add sovereignAccess field to User
ALTER TABLE "User" ADD COLUMN "sovereignAccess" BOOLEAN NOT NULL DEFAULT false;

-- Add primexUsageCount to track PRIMEX clone invocations
ALTER TABLE "User" ADD COLUMN "primexUsageCount" INTEGER NOT NULL DEFAULT 0;

-- Add lastPrimexAccess timestamp
ALTER TABLE "User" ADD COLUMN "lastPrimexAccess" TIMESTAMP;

-- Create index for sovereign access queries
CREATE INDEX "User_sovereignAccess_idx" ON "User"("sovereignAccess");
