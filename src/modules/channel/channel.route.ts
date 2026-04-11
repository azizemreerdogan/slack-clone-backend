import type { FastifyInstance } from "fastify";
import { createChannelHandler } from "./channel.controller.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole.js";
import { ChannelCreateSchema, ChannelUpdateSchema } from "./channel.schema.js";

export async function channelRoutes(server: FastifyInstance){

    server.post("/create/:workspace_id",{
        schema: {
            body: ChannelCreateSchema,
            params: {
                type: "object",
                properties: { workspace_id: { type: "string" } },
                required: ["workspace_id"]
            }
        },
        handler: createChannelHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole]
    })

    server.post("/update/:channel_id", {
        schema: {
            body: ChannelUpdateSchema,
            params: {
                type: "object",
                properties: { channel_id: { type: "string" } },
                required: ["channel_id"]
            }
        },
        handler: createChannelHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole]
    })

    server.get("/:channel_id", {
        schema: {
            params: {
                type: "object",
                properties: { channel_id: { type: "string" } },
                required: ["channel_id"]
            }
        },
        handler: createChannelHandler,
        preHandler: [authenticate, requireWorkspaceMember]
    })
}