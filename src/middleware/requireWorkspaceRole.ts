import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma.js";
import { roleChecker } from "../utils/roleChecker.js";
import { AppError } from "../errors/AppError.js";

export async function requireWorkspaceRole(request:FastifyRequest<
    {
        Params: {workspace_id: string}
    }>, reply: FastifyReply) {

        const user = request.user;
        const workspace_id = request.params.workspace_id;

        const w_member = await prisma.workspaceMember.findUniqueOrThrow({
            where: {
                user_id_workspace_id: {
                    user_id: user.id,
                    workspace_id: workspace_id
                }
            }
        })

        const isAuthorized = roleChecker(workspace_id,w_member.role)

        if(!isAuthorized){
            throw new AppError(403, "Forbidden", "WORKSPACE_ACCESS_DENIED");
        }
    
}