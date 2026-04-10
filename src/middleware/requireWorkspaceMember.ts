import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/AppError.js";
import prisma from "../lib/prisma.js";


//Checks if the UPDATE or DELETE operation is done on the workspace member's own workspace.
export async function requireWorkspaceMember(request: FastifyRequest<
    {Params: {workspace_id: string}}>, reply: FastifyReply) {
    const user = request.user
    const workspace_id = request.params.workspace_id;

    const isWorkspaceMember = await prisma.workspaceMember.findUnique({
        where: {
            user_id_workspace_id: {
                user_id: user.id,
                workspace_id: workspace_id,
            },
        },
    });

    if (!isWorkspaceMember) {
        throw new AppError(403, "Forbidden", "WORKSPACE_ACCESS_DENIED");
    }
}