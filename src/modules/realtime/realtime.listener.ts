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
    
    bus.on("notification.read", (p) => {
        const {user_id, notification_id, ...rest} = p;
        try{
            registry.send(user_id, {
                type: "notification.read",
                data: { id: notification_id, ...rest }
            })
        }catch(err){
            app.log.error({ err, notification_id}, "Notification read failed.")
        }
    })
    
    bus.on("notification.all_read", (p) => {
        const {user_id, workspace_member_id} = p;
        try{
            registry.send(user_id, {
                type: "notification.all_read",
                data: {workspace_member_id: workspace_member_id}
            })
        }catch(err){
            app.log.error({ err, workspace_member_id}, "Notification read failed.");
        }
    })

    
}
