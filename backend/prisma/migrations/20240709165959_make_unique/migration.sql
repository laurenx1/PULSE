/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Article` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `Article` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Article_title_url_key";

-- CreateIndex
CREATE UNIQUE INDEX "Article_title_key" ON "Article"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
