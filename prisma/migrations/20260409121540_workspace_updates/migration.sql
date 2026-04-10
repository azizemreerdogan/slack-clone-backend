/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `workspace` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "workspace" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace"("slug");
