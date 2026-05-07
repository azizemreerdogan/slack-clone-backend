-- CreateEnum
CREATE TYPE "AttachStatus" AS ENUM ('PENDING', 'READY');

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "attachment" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "uploader_member_id" TEXT NOT NULL,
    "message_id" TEXT,
    "storage_key" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "attach_status" "AttachStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attachment_storage_key_key" ON "attachment"("storage_key");

-- CreateIndex
CREATE INDEX "attachment_workspace_id_attach_status_created_at_idx" ON "attachment"("workspace_id", "attach_status", "created_at");

-- CreateIndex
CREATE INDEX "attachment_message_id_idx" ON "attachment"("message_id");

-- CreateIndex
CREATE INDEX "notifications_workspace_member_id_id_created_at_idx" ON "notifications"("workspace_member_id", "id", "created_at");
