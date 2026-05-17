import fastify from "fastify";
import jwtPlugin from "@fastify/jwt";
import { env } from "../config/env.js"
import { userRoutes } from "../modules/user/user.route.js"
import { messageRoutes } from "../modules/message/message.route.js"
import { workspaceRoutes } from "../modules/workspace/workspace.route.js"
import { workspaceMemberRoutes } from "../modules/workspaceMember/workspaceMember.route.js"
import { channelRoutes } from "../modules/channel/channel.route.js"
import { attachmentRoutes } from "../modules/attachment/attachment.route.js"
import { validatorCompiler , serializerCompiler} from 'fastify-type-provider-zod'
import { errorHandler } from "../middleware/errorHandler.js";
import "../types/fastify-jwt.d.js";
import { registerNotificationListeners } from "../modules/notification/notification.listener.js";
import { realtimePlugin } from "../modules/realtime/realtime.plugin.js";
import { registerRealtimeListeners } from "../modules/realtime/realtime.listener.js";

export async function buildServer(){
    const app = fastify(
        {
            logger: {
                transport: {
                    target: "pino-pretty"
                }
            },
        }
    )
    //user.schema'ya yazdığımız zod schemaların json'a dönüştürülmesi için.
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);
    app.setErrorHandler(errorHandler);

   
    
    //Bu şekilde register edebiliyoruz bunu ayrı dosyada yapıp register etmeyi araştır!
    //register plugins
    await app.register(jwtPlugin, {
        secret: env.JWT_SECRET,
        sign:{
            expiresIn: env.JWT_EXPIRES_IN
        }
    })

    //Register for notification listener 
    registerNotificationListeners(app);
    registerRealtimeListeners(app);
    app.register(realtimePlugin);

    
    //register routes
    app.register(userRoutes)
    app.register(workspaceRoutes, { prefix: '/workspaces' })
    app.register(workspaceMemberRoutes, { prefix: '/workspace-members' })
    app.register(channelRoutes, { prefix: '/channels' })
    app.register(messageRoutes, { prefix: '/messages' })
    app.register(attachmentRoutes, { prefix: '/attachments' })
    
    return app;
}