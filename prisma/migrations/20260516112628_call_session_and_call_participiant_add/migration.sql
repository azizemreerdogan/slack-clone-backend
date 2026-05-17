-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('RINGING', 'ACTIVE', 'ENDED', 'MISSED');

-- CreateTable
CREATE TABLE "call_session" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "starter_id" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "call_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_participant" (
    "id" TEXT NOT NULL,
    "call_session_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "call_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_session_channel_id_started_at_idx" ON "call_session"("channel_id", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "call_participant_call_session_id_member_id_key" ON "call_participant"("call_session_id", "member_id");

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_session" ADD CONSTRAINT "call_session_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_session" ADD CONSTRAINT "call_session_starter_id_fkey" FOREIGN KEY ("starter_id") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_participant" ADD CONSTRAINT "call_participant_call_session_id_fkey" FOREIGN KEY ("call_session_id") REFERENCES "call_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_participant" ADD CONSTRAINT "call_participant_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "workspace_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
