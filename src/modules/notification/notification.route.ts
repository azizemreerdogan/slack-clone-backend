import type { FastifyInstance } from "fastify";
import { NotificationParamsNotifIdSchema } from "./notification.schema.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import { getNotificationsHandler, markAllReadHandler, readNotificationHandler } from "./notification.controller.js";

export async function notificationRoute(server: FastifyInstance) {
    server.patch("/notifications/:notification_id/read", {
        schema: { params: NotificationParamsNotifIdSchema },
        handler: readNotificationHandler,
        preHandler: [authenticate],
    });

    server.post("/workspaces/:workspace_id/notifications/mark-all-read", {
        handler: markAllReadHandler,
        preHandler: [authenticate, requireWorkspaceMember],
    });
    
     server.get("/workspaces/:workspace_id/notifications", {
      handler: getNotificationsHandler,
      preHandler: [authenticate, requireWorkspaceMember],
    })
}
