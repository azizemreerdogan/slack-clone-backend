import type { FastifyRequest, FastifyReply } from "fastify";
import { markAllReadNotifications, readNotification } from "./notification.service.js";
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
    if (!workspaceMember) {
        throw new AppError(403, "Forbidden", "WORKSPACE_ACCESS_DENIED");
    }

    const result = await markAllReadNotifications(workspaceMember.id);
    return rep.code(200).send({ updated: result.count });
}
