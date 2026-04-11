import type { FastifyReply, FastifyRequest } from "fastify";
import type { addWorkspaceMemberInput, updateWorkspaceMemberInput } from "./workspaceMember.schema.js";
import {
    addWorkspaceMember,
    getWorkspaceMembers,
    getWorkspaceMember,
    updateWorkspaceMember,
    removeWorkspaceMember,
} from "./workspaceMember.service.js";

export async function addWorkspaceMemberHandler(request: FastifyRequest<
    {
        Body: addWorkspaceMemberInput,
        Params: { workspace_id: string }
    }>, reply: FastifyReply) {
        const { workspace_id } = request.params;
        const body = request.body;

        try {
            const member = await addWorkspaceMember(workspace_id, body);
            console.log(member);

            return reply.code(201).send({ member });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

export async function getWorkspaceMembersHandler(request: FastifyRequest<
    {
        Params: { workspace_id: string }
    }>, reply: FastifyReply) {
        const { workspace_id } = request.params;

        try {
            const members = await getWorkspaceMembers(workspace_id);
            return reply.code(200).send({ members });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

export async function getWorkspaceMemberHandler(request: FastifyRequest<
    {
        Params: { workspace_id: string, member_id: string }
    }>, reply: FastifyReply) {
        const { workspace_id, member_id } = request.params;

        try {
            const member = await getWorkspaceMember(workspace_id, member_id);
            return reply.code(200).send({ member });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

export async function updateWorkspaceMemberHandler(request: FastifyRequest<
    {
        Body: updateWorkspaceMemberInput,
        Params: { workspace_id: string, member_id: string }
    }>, reply: FastifyReply) {
        const { workspace_id, member_id } = request.params;
        const body = request.body;

        try {
            const member = await updateWorkspaceMember(workspace_id, member_id, body);
            return reply.code(200).send({ member });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

export async function removeWorkspaceMemberHandler(request: FastifyRequest<
    {
        Params: { workspace_id: string, member_id: string }
    }>, reply: FastifyReply) {
        const { workspace_id, member_id } = request.params;

        try {
            const member = await removeWorkspaceMember(workspace_id, member_id);
            return reply.code(200).send({ member });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
