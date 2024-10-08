-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "liked" INTEGER[],
    "saved" INTEGER[],
    "preferredTopics" TEXT[],
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "topics" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "clicked" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("userId","articleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
