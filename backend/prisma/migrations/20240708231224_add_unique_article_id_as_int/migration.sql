/*
  Warnings:

  - You are about to drop the column `content` on the `Article` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[articleId]` on the table `Article` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `articleId` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "content",
ADD COLUMN     "articleId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Article_articleId_key" ON "Article"("articleId");
