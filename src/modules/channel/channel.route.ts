import type { FastifyInstance } from "fastify";
import { createChannelHandler, updateChannelHandler, getChannelHandler } from "./channel.controller.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole.js";
import { ChannelCreateSchema, ChannelUpdateSchema, WorkspaceIdParamsSchema, ChannelIdParamsSchema } from "./channel.schema.js";
import { requireChannelAccess } from "../../middleware/requireChannelAccess.js"; 

export async function channelRoutes(server: FastifyInstance){

    server.post("/create/:workspace_id",{
        schema: {
            body: ChannelCreateSchema,
            params: WorkspaceIdParamsSchema,
        },
        handler: createChannelHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole]
    })

    server.post("/update/:channel_id", {
        schema: {
            body: ChannelUpdateSchema,
            params: ChannelIdParamsSchema,
        },
        handler: updateChannelHandler,
        preHandler: [authenticate, requireChannelAccess]
    })

    //Workspace member'ı olup olmadığını kontrol edebilmemiz için workspace_id verilmesi gerekiyor.
    //Ama gerek yok onun yerine ayrı bir middleware yazacağız ve bu şekilde workspace_id girebileceğiz.
    server.get("/:channel_id", {
        schema: {
            params: ChannelIdParamsSchema,
        },
        handler: getChannelHandler,
        preHandler: [authenticate, requireChannelAccess]
    })
}