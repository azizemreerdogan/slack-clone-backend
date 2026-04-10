import type { FastifyInstance } from "fastify";
import { UserCreateSchema } from "../user/user.schema.js";
import { WorkspaceCreateSchema, WorkspaceUpdateSchema } from "./workspace.schema.js";
import { createWorkspaceHandler, getWorkspaceHandler, updateWorkspaceHandler } from "./workspace.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import { string } from "zod";
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
            params: {
                type: "object",
                properties: { workspace_id: { type: "string" } },
                required: ["workspace_id"]
            }
        },
        handler: updateWorkspaceHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole]
    })

    server.get("/", {
        schema: {
            params: {slug: string} 
        },
        handler: getWorkspaceHandler,
        preHandler: [authenticate]
    })
}