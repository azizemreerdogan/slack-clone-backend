import type { createUserInput } from "./user.schema.js";
import { hashPassword } from "../utils/hash.js";
import prisma from '../lib/prisma.js'
import { AppError } from "../errors/AppError.js";

export async function createUser(createUserInput : createUserInput){
    const { name, email, password} = createUserInput;
    const existingUser = await prisma.user.findUnique({where: {email}})
    
    if(existingUser){
        throw new AppError(409, "User with this email already exists") 
    }
    
    const hash = await hashPassword(password);
    
    const user = await prisma.user.create({
        data: {
            name: name || null,
            email,
            password: hash,
        }
    });

    return user;
}

export async function getUsers(){
    const users = await prisma.user.findMany();
    
    return users;
}

export async function getUserByEmail(email : string){
    const user = await prisma.user.findUnique({where: {email}})
    return user;
}