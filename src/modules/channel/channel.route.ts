import type { FastifyInstance } from "fastify";
import { createChannelHandler, updateChannelHandler, getChannelHandler } from "./channel.controller.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole.js";
import { ChannelCreateSchema, ChannelUpdateSchema } from "./channel.schema.js";
import { requireChannelAccess } from "../../middleware/requireChannelAccess.js"; 

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
        handler: updateChannelHandler,
        preHandler: [authenticate, requireChannelAccess]
    })

    //Workspace member'ı olup olmadığını kontrol edebilmemiz için workspace_id verilmesi gerekiyor.
    //Ama gerek yok onun yerine ayrı bir middleware yazacağız ve bu şekilde workspace_id girebileceğiz.
    server.get("/:channel_id", {
        schema: {
            params: {
                type: "object",
                properties: { channel_id: { type: "string" } },
                required: ["channel_id"]
            }
        },
        handler: getChannelHandler,
        preHandler: [authenticate, requireChannelAccess]
    })
}