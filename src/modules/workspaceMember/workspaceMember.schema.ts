import { z } from "zod"

export const RoleTypeSchema = z.enum(['ADMIN', 'OWNER', 'MEMBER']);
export const MemberStatusSchema = z.enum(['ONLINE', 'OFFLINE', 'IDLE']);

export const WorkspaceMemberAddSchema = z.object({
  user_id: z.uuid('Invalid UUID format'),
  role: RoleTypeSchema.default('MEMBER'),
  display_name: z.string().min(1, 'Display name cannot be empty').optional(),
});

export const WorkspaceMemberUpdateSchema = z.object({
  role: RoleTypeSchema.optional(),
  display_name: z.string().min(1, 'Display name cannot be empty').optional(),
  member_status: MemberStatusSchema.optional(),
});

export const WorkspaceMemberParamsSchema = z.object({
  workspace_id: z.uuid('Invalid UUID format'),
  member_id: z.uuid('Invalid UUID format'),
});

export const WorkspaceMemberWorkspaceParamsSchema = z.object({
  workspace_id: z.uuid('Invalid UUID format'),
});

export type addWorkspaceMemberInput = z.infer<typeof WorkspaceMemberAddSchema>;
export type updateWorkspaceMemberInput = z.infer<typeof WorkspaceMemberUpdateSchema>;
