import type { WorkspaceMember } from "../../generated/prisma/client.js";

declare module "fastify"{
    interface FastifyRequest{
        workspaceMember? : WorkspaceMember
        workspace_id? : string
    }
}