import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import {
    CreatePresignedUploadSchema,
    WorkspaceParamsSchema,
    AttachmentParamsSchema,
} from "./attachment.schema.js";
import {
    createPresignedUploadHandler,
    completeUploadHandler,
    getDownloadUrlHandler,
} from "./attachment.controller.js";

export async function attachmentRoutes(server: FastifyInstance) {
    server.post("/workspaces/:workspace_id/upload-url", {
        schema: {
            body: CreatePresignedUploadSchema,
            params: WorkspaceParamsSchema,
        },
        handler: createPresignedUploadHandler,
        preHandler: [authenticate, requireWorkspaceMember],
    });

    server.post("/workspaces/:workspace_id/:attachment_id/complete", {
        schema: {
            params: AttachmentParamsSchema,
        },
        handler: completeUploadHandler,
        preHandler: [authenticate, requireWorkspaceMember],
    });

    server.get("/workspaces/:workspace_id/:attachment_id/download-url", {
        schema: {
            params: AttachmentParamsSchema,
        },
        handler: getDownloadUrlHandler,
        preHandler: [authenticate, requireWorkspaceMember],
    });
}
