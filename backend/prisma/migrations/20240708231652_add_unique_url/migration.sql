/*
  Warnings:

  - You are about to drop the column `articleId` on the `Article` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Article` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Article_articleId_key";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "articleId";

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
