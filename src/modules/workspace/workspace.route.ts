import type { FastifyInstance } from "fastify";
import { UserCreateSchema } from "../user/user.schema.js";
import { WorkspaceCreateSchema } from "./workspace.schema.js";
import { createWorkspaceHandler } from "./workspace.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export async function workspaceRoutes(server: FastifyInstance){

    server.post("/",{
        schema:{
            body: WorkspaceCreateSchema
        },
        handler: createWorkspaceHandler,
        preHandler: [authenticate, ],

    })
}