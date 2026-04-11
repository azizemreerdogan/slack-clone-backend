import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma.js";
import { AppError } from "../errors/AppError.js";

//Update/Get endpointlerinde'ki middleware'lar workspace_id istiyor. Sadece user ve channel_id'den workspace id bulunacak.
export async function requireChannelAccess(request: FastifyRequest<
    {
        Params: {channel_id: string}
    }>, reply: FastifyReply){

        const user = request.user;
        const channel_id = request.params.channel_id as string;
        
        //User ve channel_id joinlenerek workspace bulunur.
        const channel = await prisma.channel.findFirst({
            where: {
                id: channel_id,
                workspace: {
                members: {
                    some: { user_id: request.user.id },
                },
                },
            },
            select: {
                workspace_id: true,
            },
        });

        if(!channel) {
            throw new AppError(403, "Forbidden", "WORKSPACE_ACCESS_DENIED")
        }

        const workspace_id = channel.workspace_id;
        request.workspace_id = workspace_id;
}