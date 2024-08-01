-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastAsked" TEXT,
ADD COLUMN     "lastAskedKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
