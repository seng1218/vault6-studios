-- Add user profile fields (isPublicProfile, operativeName)
ALTER TABLE "User" ADD COLUMN "isPublicProfile" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "operativeName" TEXT;
