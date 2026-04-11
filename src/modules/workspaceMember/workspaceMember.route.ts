import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import { requireWorkspaceMember } from "../../middleware/requireWorkspaceMember.js";
import { requireWorkspaceRole } from "../../middleware/requireWorkspaceRole.js";
import {
    WorkspaceMemberAddSchema,
    WorkspaceMemberUpdateSchema,
    WorkspaceMemberParamsSchema,
    WorkspaceMemberWorkspaceParamsSchema,
} from "./workspaceMember.schema.js";
import {
    addWorkspaceMemberHandler,
    getWorkspaceMembersHandler,
    getWorkspaceMemberHandler,
    updateWorkspaceMemberHandler,
    removeWorkspaceMemberHandler,
} from "./workspaceMember.controller.js";

export async function workspaceMemberRoutes(server: FastifyInstance) {

    server.post("/:workspace_id", {
        schema: {
            body: WorkspaceMemberAddSchema,
            params: WorkspaceMemberWorkspaceParamsSchema,
        },
        handler: addWorkspaceMemberHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole],
    })

    server.get("/:workspace_id", {
        schema: {
            params: WorkspaceMemberWorkspaceParamsSchema,
        },
        handler: getWorkspaceMembersHandler,
        preHandler: [authenticate, requireWorkspaceMember],
    })

    server.get("/:workspace_id/:member_id", {
        schema: {
            params: WorkspaceMemberParamsSchema,
        },
        handler: getWorkspaceMemberHandler,
        preHandler: [authenticate, requireWorkspaceMember],
    })

    server.patch("/:workspace_id/:member_id", {
        schema: {
            body: WorkspaceMemberUpdateSchema,
            params: WorkspaceMemberParamsSchema,
        },
        handler: updateWorkspaceMemberHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole],
    })

    server.delete("/:workspace_id/:member_id", {
        schema: {
            params: WorkspaceMemberParamsSchema,
        },
        handler: removeWorkspaceMemberHandler,
        preHandler: [authenticate, requireWorkspaceMember, requireWorkspaceRole],
    })
}
