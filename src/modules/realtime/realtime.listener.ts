import type { FastifyInstance } from "fastify";
import { bus } from "../../lib/events.js";
import { registry } from "../realtime/realtime.registry.js";

export function registerRealtimeListeners(app: FastifyInstance) {
    bus.on("notification.created", (p) => {
        const { user_id, notification_id, ...rest } = p;
        try {
            registry.send(user_id, {
                type: "notification.created",
                data: { id: notification_id, ...rest },
            });
        } catch (err) {
            app.log.error({ err, notification_id }, "Notification push failed");
        }
    });

    //bus.on("notification.read") -> notification/readNotification 
}
