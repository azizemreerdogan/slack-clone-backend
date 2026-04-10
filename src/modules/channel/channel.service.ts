import type { createChannelInput} from "./channel.schema.js"
import prisma from '../../lib/prisma.js';
import { AppError } from "../../errors/AppError.js"; 

//Workspace id'nin controllerdan gelmesi gerekiyor. 
export async function createChannel(createChannelInput: createChannelInput){
    const {name, channel_type, workspace_id } = createChannelInput;
    
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