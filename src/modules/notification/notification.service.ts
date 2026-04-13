import type { createNotificationInput } from "./notification.schema.js";
import prisma from "../../lib/prisma.js";

export async function createNotifications(
    inputs: createNotificationInput[],)
    {
        
        
        if(inputs.length == 0){
            return
        }
        
        return await prisma.notification.createMany({
            data: inputs.map((i) => ({
            workspace_member_id: i.workspace_member_id,
            entity_type: i.entity_type,
            notification_type: i.notification_type,
            ...(i.entity_id && {entity_id: i.entity_id})
            })),
            skipDuplicates: true,
        })
   
    }

    
//Resolve mentions

//Resolve if come from thread (will be used when creating notifications.)

