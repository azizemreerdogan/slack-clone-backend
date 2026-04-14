import type { FastifyReply, FastifyRequest } from "fastify";
import type { createChannelInput, createDMChannelInput, updateChannelInput } from "./channel.schema.js";
import { createChannel, createDMChannel, getChannel, updateChannel } from "./channel.service.js";


export async function createChannelHandler(request: FastifyRequest<
    { Body: createChannelInput,
        Params: { workspace_id: string }
    }
>, reply: FastifyReply){

    const workspace_id = request.params.workspace_id as string;
    const body = request.body;


    try{
        const channel = await createChannel(body, workspace_id);
        console.log(channel);

        return reply.code(201).send({
            channel
        })
    }catch(error){
        console.error(error);
        throw error;
    }
    
}

export async function createDMChannelHandler(request: FastifyRequest<
    {
        Body: createDMChannelInput,
        Params: {workspace_id: string, dm_member_id: string}
    }>, reply: FastifyReply){
        const body= request.body;
        const workspace_id = request.params.workspace_id as string;
        const current_member_id = request.workspaceMember!.id;
        const dm_member_id = request.params.dm_member_id;

        try{
            const channel = await createDMChannel(body,workspace_id,current_member_id,dm_member_id);
            console.log(channel);

            return reply.code(201).send({
                channel
            })
        }catch(e){
            console.error(e);
            throw e;
        }
    }

export async function updateChannelHandler(request: FastifyRequest<
    {
        Body: updateChannelInput,
        Params: { channel_id: string }
    }
>, reply: FastifyReply){
    const channel_id = request.params.channel_id as string;
    const body = request.body;

    try{
        const channel = await updateChannel(channel_id, body);
        console.log(channel);

        return reply.code(200).send({
            channel
        })
    }catch(error){
        console.error(error);
        throw error;
    }
}

export async function getChannelHandler(request: FastifyRequest<
    {
        Params: { channel_id: string }
    }
>, reply: FastifyReply){
    
    const channel_id = request.params.channel_id as string;

    try{
        const channel = await getChannel(channel_id);
        console.log(channel);

        return reply.code(200).send({
            channel
        })
    }catch(error){
        console.error(error);
        throw error;
    }
}