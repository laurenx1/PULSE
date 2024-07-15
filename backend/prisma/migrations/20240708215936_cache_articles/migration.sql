/*
  Warnings:

  - You are about to drop the column `topics` on the `Article` table. All the data in the column will be lost.
  - The primary key for the `Interaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clicked` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `Interaction` table. All the data in the column will be lost.
  - Added the required column `author` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "topics",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "saves" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_pkey",
DROP COLUMN "clicked",
DROP COLUMN "timeSpent",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "liked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saved" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id");
