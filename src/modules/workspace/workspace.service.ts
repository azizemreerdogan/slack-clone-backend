import type { createWorkspaceInput, updateWorkspaceInput } from "./workspace.schema.js";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { createWorkspaceOwner } from "../workspaceMember/workspaceMember.service.js";


export async function createWorkspace(user_id: string,createWorkspaceInput: createWorkspaceInput){
    const {name, description, slug} = createWorkspaceInput;

    try{
        const workspace =  await prisma.workspace.create({
        data: { name, description: description ?? null, slug }
        })

        await createWorkspaceOwner(user_id, workspace.id)

        return workspace
    }catch(e){
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new AppError(409, 'Workspace already exists with same slug')
        }
        throw e
    }
    

    
}

export async function getWorkspace(slug: string){
    const workspace = await prisma.workspace.findUnique({where: {slug}})
    if(!workspace){
        throw new AppError(404, "Workspace with this slug does not exist")
    }
}


//Role based operations are being enforced on the route level as a middleware.
export async function updateWorkspace(id: string,updateWorkspaceInput: updateWorkspaceInput){
    const {name, description, slug, status} = updateWorkspaceInput;

    try{
        return await prisma.workspace.update({
            where: { id },
            data: {
                ...(name !== undefined && {name}),
                ...(description !== undefined && { description}),
                ...(slug !== undefined && {slug}),
                ...(status !== undefined && {status})
            }
        })
    }catch(e){
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new AppError(404, 'Workspace not found')
        }
        throw e
    }
}