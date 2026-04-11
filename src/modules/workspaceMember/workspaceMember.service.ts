import type { addWorkspaceMemberInput, updateWorkspaceMemberInput } from "./workspaceMember.schema.js";
import prisma from "../../lib/prisma.js";
import { AppError } from "../../errors/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";

// Creator of a workspace becomes OWNER. Called internally from workspace.service.
export async function createWorkspaceOwner(user_id: string, workspace_id: string) {
    return await prisma.workspaceMember.create({
        data: {
            user_id,
            workspace_id,
            role: 'OWNER',
            joined_at: new Date(),
        },
    });
}

export async function addWorkspaceMember(workspace_id: string, input: addWorkspaceMemberInput) {
    const user = await prisma.user.findUnique({ where: { id: input.user_id } });
    if (!user) {
        throw new AppError(404, "User not found");
    }

    try {
        return await prisma.workspaceMember.create({
            data: {
                user_id: input.user_id,
                workspace_id,
                role: input.role,
                display_name: input.display_name ?? null,
                joined_at: new Date(),
            },
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new AppError(409, "User is already a member of this workspace");
        }
        throw e;
    }
}

export async function getWorkspaceMembers(workspace_id: string) {
    return await prisma.workspaceMember.findMany({
        where: { workspace_id },
        orderBy: { joined_at: 'asc' },
    });
}

export async function getWorkspaceMember(workspace_id: string, member_id: string) {
    const member = await prisma.workspaceMember.findUnique({
        where: { id: member_id },
    });
    if (!member || member.workspace_id !== workspace_id) {
        throw new AppError(404, "Workspace member not found");
    }
    return member;
}

//Role based operations are being enforced on the route level as a middleware.
export async function updateWorkspaceMember(
    workspace_id: string,
    member_id: string,
    input: updateWorkspaceMemberInput,
) {
    const existing = await prisma.workspaceMember.findUnique({ where: { id: member_id } });
    if (!existing || existing.workspace_id !== workspace_id) {
        throw new AppError(404, "Workspace member not found");
    }

    // Prevent demoting the sole OWNER of the workspace.
    if (input.role !== undefined && existing.role === 'OWNER' && input.role !== 'OWNER') {
        throw new AppError(400, "Cannot change the role of the workspace owner");
    }

    try {
        return await prisma.workspaceMember.update({
            where: { id: member_id },
            data: {
                ...(input.role !== undefined && { role: input.role }),
                ...(input.display_name !== undefined && { display_name: input.display_name }),
                ...(input.member_status !== undefined && { member_status: input.member_status }),
            },
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new AppError(404, "Workspace member not found");
        }
        throw e;
    }
}

export async function removeWorkspaceMember(workspace_id: string, member_id: string) {
    const member = await prisma.workspaceMember.findUnique({ where: { id: member_id } });
    if (!member || member.workspace_id !== workspace_id) {
        throw new AppError(404, "Workspace member not found");
    }
    if (member.role === 'OWNER') {
        throw new AppError(400, "Cannot remove the workspace owner");
    }

    try {
        return await prisma.workspaceMember.delete({ where: { id: member_id } });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new AppError(404, "Workspace member not found");
        }
        throw e;
    }
}
