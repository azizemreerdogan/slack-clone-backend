import type { FastifyInstance } from "fastify";
import { UserCreateSchema, UserLoginSchema } from "./user.schema.js";
import { registerUserHandler, loginUserHandler, deleteUserHandler } from "./user.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export async function userRoutes(server: FastifyInstance){

    server.post("/register",{
        schema:{
            body: UserCreateSchema
        },
        handler: registerUserHandler
    })

    server.post("/login",{
        schema:{
            body: UserLoginSchema
        },
        handler: loginUserHandler
    })
    
    server.post("/delete",{
        handler: deleteUserHandler,
        preHandler: [authenticate]
    })

}
