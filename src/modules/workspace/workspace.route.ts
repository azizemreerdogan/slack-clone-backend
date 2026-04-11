import type { FastifyInstance } from "fastify";
import { UserCreateSchema } from "../user/user.schema.js";
import { WorkspaceCreateSchema, WorkspaceUpdateSchema, WorkspaceParamsSchema } from "./workspace.schema.js";
import { createWorkspaceHandler, getWorkspaceHandler, updateWorkspaceHandler } from "./workspace.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole.js";

export async function workspaceRoutes(server: FastifyInstance){

    server.post("/create",{
        schema:{
            body: WorkspaceCreateSchema,
        },
        handler: createWorkspaceHandler,
        preHandler: [authenticate],
    })

    server.post("/update/:workspace_id", {
        schema: {
            body: WorkspaceUpdateSchema,
            params: WorkspaceParamsSchema,
        },
        handler: updateWorkspaceHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole]
    })

    server.get("/", {
        handler: getWorkspaceHandler,
        preHandler: [authenticate]
    })
}