import type { FastifyRequest, FastifyReply } from "fastify";
import { getNotifications, markAllReadNotifications, readNotification } from "./notification.service.js";
import type { notifIdParamsNotificationInput } from "./notification.schema.js";
import { AppError } from "../../errors/AppError.js";

export async function readNotificationHandler(
    req: FastifyRequest<{ Params: notifIdParamsNotificationInput }>,
    rep: FastifyReply,
){
    const { notification_id } = req.params;
    const user_id = req.user.id;

    await readNotification(notification_id, user_id);
    return rep.code(204).send();
}

export async function markAllReadHandler(
    req: FastifyRequest<{ Params: { workspace_id: string } }>,
    rep: FastifyReply,
){
    const workspaceMember = req.workspaceMember;
    const user = req.user
    if (!workspaceMember) {
        throw new AppError(403, "Forbidden", "WORKSPACE_ACCESS_DENIED");
    }

    const { count } = await markAllReadNotifications(workspaceMember.id, user.id);
    return rep.code(200).send({ updated: count });
}

export async function getNotificationsHandler(
    req: FastifyRequest<{ Params: { workspace_id: string }; Querystring: {limit: number, cursor_string?: string}}>,
    rep: FastifyReply,
){
    const query = req.query;
    const workspaceMember = req.workspaceMember;
    if(!workspaceMember) {
        throw new AppError(403, "Forbidden", "WORKSPACE_ACCESS_ERROR")
    }
    const workspace_member_id = workspaceMember.id
    
    const result = await getNotifications(query.limit, workspace_member_id, query.cursor_string);
    return rep.code(200).send({notifications: result.notifications, next_cursor: result.next_cursor})
}

