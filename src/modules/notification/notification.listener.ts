import type { FastifyInstance } from "fastify";
import { bus } from "../../lib/events.js"
import { handleMessageCreated } from "./notification.handler.js";
import { createNotifications } from "./notification.service.js";


export function registerNotificationListeners(app: FastifyInstance){

    
    //On message creation
    bus.on("message.created", (e) => {
        handleMessageCreated(e)
            .then((inputs) => createNotifications(inputs))
                .catch((err) => app.log.error(err.message, "message.created event error"))
    })

    
}