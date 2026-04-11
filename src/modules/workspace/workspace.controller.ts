import type { FastifyReply, FastifyRequest } from "fastify";
import type { createWorkspaceInput, updateWorkspaceInput } from "./workspace.schema.js";
import { createWorkspace, getWorkspace, updateWorkspace } from "./workspace.service.js";

export async function createWorkspaceHandler(request: FastifyRequest<
    {
        Body: createWorkspaceInput
    }>, reply: FastifyReply){
        const body = request.body;
        const user = request.user;
        

        try{
            const workspace = await createWorkspace(user.id,body);

            console.log(workspace);

            return reply.code(201).send({
                workspace: {
                    id: workspace.id,
                    name: workspace.name,
                    slug: workspace.slug,
                    description: workspace.description,
                }
            })

        }catch(error){
            console.error(error)
            throw error
        }


    }

export async function getWorkspaceHandler(request: FastifyRequest<
    {
        Params: {slug: string}
    }
    >, reply: FastifyReply){

        const slug = request.params.slug
        try{
            const workspace = await getWorkspace(slug);
            return reply.code(200).send(workspace)
        }catch(error){
            console.error(error);
            throw error;
        }
    }

export async function updateWorkspaceHandler(request: FastifyRequest<
    {
        Params: { workspace_id: string },
        Body: updateWorkspaceInput
    }
    >, reply: FastifyReply){
        const { workspace_id } = request.params;
        const body = request.body;

        try{
            const updatedWorkspace = await updateWorkspace(workspace_id, body);
            return reply.code(200).send(updatedWorkspace);
        }catch(error){
            console.error(error);
            throw error;
        }
    }