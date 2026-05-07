import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreatePresignedUploadInput } from "./attachment.schema.js";
import {
    createPresignedUpload,
    completeUpload,
    getDownloadUrl,
} from "./attachment.service.js";

export async function createPresignedUploadHandler(
    request: FastifyRequest<{
        Body: CreatePresignedUploadInput;
        Params: { workspace_id: string };
    }>,
    reply: FastifyReply,
) {
    const { filename, mime, size } = request.body;
    const { workspace_id } = request.params;
    const uploader_member_id = request.workspaceMember!.id;

    try {
        const presigned = await createPresignedUpload(
            workspace_id,
            uploader_member_id,
            filename,
            mime,
            size,
        );
        return reply.code(201).send({ presigned });
    } catch (error) {
        throw error;
    }
}

export async function completeUploadHandler(
    request: FastifyRequest<{
        Params: { workspace_id: string; attachment_id: string };
    }>,
    reply: FastifyReply,
) {
    const { workspace_id, attachment_id } = request.params;

    try {
        const attachment = await completeUpload(attachment_id, workspace_id);
        return reply.code(200).send({ attachment });
    } catch (error) {
        throw error;
    }
}

export async function getDownloadUrlHandler(
    request: FastifyRequest<{
        Params: { workspace_id: string; attachment_id: string };
    }>,
    reply: FastifyReply,
) {
    const { workspace_id, attachment_id } = request.params;

    try {
        const download = await getDownloadUrl(attachment_id, workspace_id);
        return reply.code(200).send({ download });
    } catch (error) {
        throw error;
    }
}
