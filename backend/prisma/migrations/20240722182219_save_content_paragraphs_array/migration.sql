-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "content" TEXT[] DEFAULT ARRAY[]::TEXT[];
