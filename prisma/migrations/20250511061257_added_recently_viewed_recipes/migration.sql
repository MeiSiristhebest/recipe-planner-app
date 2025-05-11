/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "RecentlyViewedRecipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyViewedRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentlyViewedRecipe_userId_viewedAt_idx" ON "RecentlyViewedRecipe"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyViewedRecipe_userId_recipeId_key" ON "RecentlyViewedRecipe"("userId", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "RecentlyViewedRecipe" ADD CONSTRAINT "RecentlyViewedRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewedRecipe" ADD CONSTRAINT "RecentlyViewedRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
