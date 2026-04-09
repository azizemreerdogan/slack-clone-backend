import {type FastifyReply, type FastifyRequest } from "fastify";
import { userDeleteSchema, type createUserInput, type loginUserHandler } from "./user.schema.js";
import { createUser, getUserByEmail } from "./user.service.js";
import { verifyPassword } from "../../utils/hash.js";
import { deleteUser } from "./user.service.js";

export async function registerUserHandler(request: FastifyRequest<{
    Body: createUserInput
}>, reply: FastifyReply) {
    const body = request.body;

    try {
        const user = await createUser(body);

        console.error(user)

        const token = reply.jwtSign({
            id: user.id,
            email: user.email
        });

        return reply.code(201).send({
            user,
            token
        });

    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}


export async function loginUserHandler(request: FastifyRequest<{
    Body: loginUserHandler
}>, reply: FastifyReply){

    const {email, password} = request.body;

    try{
        const user = await getUserByEmail(email);

        if(!user){
            return reply.code(401).send({
                error: "Invalid email or password"
            })
        }

        const isPasswordValid = await verifyPassword(password, user.password);

        if(!isPasswordValid){
            return reply.code(401).send({
                error: "Invalid email or password"
            });
        };

        const token = await reply.jwtSign({
            id: user.id,
            email: user.email
        })
        
        return reply.code(200).send({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token: token
            
        });
    }catch(error){
        throw error;
    }
}

export async function deleteUserHandler(request: FastifyRequest<{
    Body: userDeleteSchema
}>, reply: FastifyReply){
    
    const email = request.user.email;
    const id = request.user.id;
    
    console.log(email , id)
    
    try{
        const user = await deleteUser(id,email)
        
        console.log(user)
        return reply.code(200).send({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })
    }catch(error){
        throw error
    }
       
}
