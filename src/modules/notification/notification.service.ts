import type { createNotificationInput } from "./notification.schema.js";
import prisma from "../../lib/prisma.js";
import type { Notification } from "../../../generated/prisma/client.js";
import { bus } from "../../lib/events.js";
import { AppError } from "../../errors/AppError.js";

//Not exposed to the rest api, used internally with events.
export async function createNotifications(
    inputs: createNotificationInput[],)
    {
        if(inputs.length == 0){
            return
        }

        const notifications: Notification[] = await prisma.notification.createManyAndReturn({
            data: inputs.map((i) => ({
            workspace_member_id: i.workspace_member_id,
            entity_type: i.entity_type,
            notification_type: i.notification_type,
            ...(i.entity_id && {entity_id: i.entity_id})
            })),
            skipDuplicates: true,
        })

        if(notifications.length === 0) return;


        const memberIds : string[]= [...new Set(notifications.map((n) =>
            n.workspace_member_id
        ))];
        const members = await prisma.workspaceMember.findMany({
            where: { id: { in: memberIds } },
            select: { id: true, user_id: true },
        });
        const userIdByMember= new Map(members.map((m) => [m.id,m.user_id]));

        for(const n of notifications){
            const userId = userIdByMember.get(n.workspace_member_id);
            //Best-effort, if userId cant found pass.
            if(!userId) continue;

            bus.emit("notification.created", {
                notification_id: n.id,
                workspace_member_id: n.workspace_member_id,
                user_id: userId,
                entity_id: n.entity_id,
                entity_type: n.entity_type,
                notification_type: n.notification_type,
                created_at: n.created_at ? n.created_at.toISOString() : null,
                is_read: n.is_read
            })
        }
    }

    
    
//Get notifications with cursor pagination 
export async function getNotifications(limit: number = 20, workspace_member_id: string, cursor_string?: string){
    let cursor : {created_at: string, id: string} | undefined;
    if(cursor_string){
         cursor = JSON.parse(
        Buffer.from(cursor_string, "base64url").toString()
        );
    }
    
    
    const notifications = await prisma.notification.findMany({
        where:{
            workspace_member_id: workspace_member_id,
            ...(cursor && {
                OR: [
                    { created_at: { lt: new Date(cursor.created_at) } },
                    { created_at: new Date(cursor.created_at), id: { lt: cursor.id } },
                ],
            })
        },
        orderBy: [
            {created_at: "desc"},
            {id: "desc"}
        ],
        take: limit
    })
    
    const last = notifications[notifications.length -1]
    const next_cursor = notifications.length == limit && last ? 
                    Buffer.from(JSON.stringify({created_at: last.created_at, id: last.id})).toString("base64url") :
                    null
    return {notifications, next_cursor};
    
    
}

//Mark a single notification as read. Scoped by the authenticated user via workspace_member relation.
export async function readNotification(notification_id: string, user_id: string){
    const notification = await prisma.notification.findFirst({
        where: {
            id: notification_id,
            workspace_member: { user_id },
        },
    });

    if (!notification) {
        throw new AppError(404, "Notification not found", "NOTIFICATION_NOT_FOUND");
    }

    await prisma.notification.update({
        where: { id: notification_id },
        data: { is_read: true },
    });

    bus.emit("notification.read", {
        user_id,
        notification_id: notification.id,
        workspace_member_id: notification.workspace_member_id,
        created_at: notification.created_at,
    });
}

//Mark all notifications as read for a single workspace membership.
export async function markAllReadNotifications(workspace_member_id: string, user_id: string){
    const { count } = await prisma.notification.updateMany({
        where: { workspace_member_id, is_read: false },
        data: { is_read: true },
    });

    bus.emit("notification.all_read", {
        workspace_member_id,
        user_id,
    });

    return { count };
}
