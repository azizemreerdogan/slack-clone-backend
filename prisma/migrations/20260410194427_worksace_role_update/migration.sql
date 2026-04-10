/*
  Warnings:

  - Made the column `role` on table `workspace_members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "workspace_members" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'MEMBER';
