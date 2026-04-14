import type { createChannelInput, createDMChannelInput, updateChannelInput} from "./channel.schema.js"
import prisma from '../../lib/prisma.js';
import { AppError } from "../../errors/AppError.js"; 
import { Prisma, type WorkspaceMember } from "../../../generated/prisma/client.js";

//Workspace id is given as parameter and member checking is enforced with middleware.
export async function createChannel(createChannelInput: createChannelInput, workspace_id: string){
    const {name, channel_type} = createChannelInput;
    
    const existingChannel = await prisma.channel.findFirst({
        where: { name, workspace_id },
    })
    if(existingChannel){
        throw new AppError(409, "Channel with this name already exists")
    }

    const channel = await prisma.channel.create({
        data: {
            name,
            channel_type,
            workspace_id,
        }
    })

    return channel
}

export async function createDMChannel(createChannelInput: createDMChannelInput,
     workspace_id: string,current_member_id: string, dm_member_id: string){
    const name = createChannelInput.name;
    const existing = await prisma.channel.findFirst({
        where: {
            name: name,
            workspace_id,
            channel_type: 'DM',
            AND: [
               {members: {some: {workspace_member_id: current_member_id}}},
               {members: {some: {workspace_member_id: dm_member_id}}} 
            ] 
        }
    })

    if(existing) return existing;

    return prisma.channel.create(
        {
            data: {
                workspace_id,
                channel_type: 'DM',
                name: null,
                members: {
                    create: [
                        {workspace_member_id: current_member_id},
                        {workspace_member_id: dm_member_id}
                    ]
                }
            },
            include: { members: true }
        }
    )

}

export async function updateChannel(channel_id: string,updateChannelInput: updateChannelInput){
    const {name, channel_type, is_archived} = updateChannelInput;

    try{
        return await prisma.channel.update(
            {
                where: {id: channel_id},
                data: {
                    ...(name != undefined && {name}),
                    ...(channel_type != undefined && {channel_type}),
                    ...(is_archived != undefined && {is_archived})
                }
            }
        )
    }catch(e){
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new AppError(404, 'Channel not found')
        }
        throw e
    }
}

export async function getChannel(channel_id: string){
    const channel = await prisma.channel.findUnique({where: {id: channel_id}})
    if(!channel){
        throw new AppError(404, "Channel with this id does not exist")
    }
    return channel
}

