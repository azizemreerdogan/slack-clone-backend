-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploader_member_id_fkey" FOREIGN KEY ("uploader_member_id") REFERENCES "workspace_members"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
