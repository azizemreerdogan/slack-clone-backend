import type { FastifyInstance } from "fastify";
import { UserCreateSchema, UserLoginSchema } from "./user.schema.js";
import { registerUserHandler, loginUserHandler } from "./user.controller.js";

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

}
