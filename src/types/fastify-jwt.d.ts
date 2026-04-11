import type { UserCreationStatus, UserPresenceStatus } from "../../generated/prisma/enums.js";
import type { WorkspaceMember } from "../../generated/prisma/client.js";


//The reason for this interface is on authentication request.user is passed from here.
declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: string;
            email: string;
            name?: string,
            password: string
            created_at: Date
            updated_at: Date
            user_presence_status: UserPresenceStatus
            user_creation_status: UserCreationStatus
        }
    }
}
