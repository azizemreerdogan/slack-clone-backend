import type { MessageCreatedEvent } from "../../lib/events.js";
import type { createNotificationInput } from "./notification.schema.js";
import prisma from "../../lib/prisma.js";

//Handler for message.created, we return createNotificationInput array and that array will be processed by notification.listener
export async function handleMessageCreated(e: MessageCreatedEvent): 
Promise<createNotificationInput[]>{
    const inputs : createNotificationInput[] = [];
    const mentionRegex = /(?<!\w)@([a-zA-Z0-9_]{1,30})/g

    //a) Thread_reply -> notifies the parent message sender.
    if(e.parent_msg_id){
        const parent = await prisma.message.findUnique({
            where: {
                id: e.parent_msg_id,
            },
            select: {sender_id: true}
        })

        if(parent && parent.sender_id !== e.sender_id){
            inputs.push(
                {
                    workspace_member_id: parent.sender_id,
                    entity_type: "MESSAGE",
                    entity_id: e.message_id,
                    notification_type: "THREAD_REPLY"
                }
            )
        }
    }

    //b) Mention, @mention should be parsed and create message input should be created. 
    // (All of the mentioned people should be added to list to push a notification to all of them)
    
    //Maps all of the mentions in the content.
    const mentions = Array.from(
        e.content?.matchAll(mentionRegex) ?? [],
        (m) => m[1]
    );

    const uniqueMentions = [... new Set(mentions)]

    const mentionedMembers =
     uniqueMentions
      ? []
      : await prisma.workspaceMember.findMany({

        where: {
            //Should query on the same workspace as sender.
            workspace_id: (await prisma.workspaceMember.findUniqueOrThrow({
                where: { id: e.sender_id},
                select: {workspace_id: true},
            })).workspace_id,

            //Should exclude the sender from getting notified.
            NOT: { id: e.sender_id},

            display_name: {in: uniqueMentions}   
        },
        select: {id: true}    
      })
    
    inputs.push(
        ...mentionedMembers.map((m) => ({
            workspace_member_id: m.id,
            entity_type: "MESSAGE" as const,
            entity_id: e.message_id,
            notification_type: "MESSAGE_MENTION" as const,
        }))
    )

    


    //c) DM received. (Should work only on dm channels)
    

    return inputs;
}