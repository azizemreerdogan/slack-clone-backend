import { z } from 'zod'
export const ChannelTypeSchema = z.enum(['PUBLIC', 'PRIVATE', 'DM', 'GROUP_DM']);

export const ChannelCreateSchema = z.object({
  name: z.string().min(1, 'Channel name cannot be empty'),
  channel_type: ChannelTypeSchema.default('PUBLIC'),
  workspace_id: z.uuid('Invalid UUID format'),
});

export const ChannelUpdateSchema = z.object({
  name: z.string().min(1, 'Channel name cannot be empty').optional(),
  channel_type: ChannelTypeSchema.optional(),
  is_archived: z.boolean().optional(),
});

export const ChannelSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  name: z.string().nullable(),
  channel_type: ChannelTypeSchema,
  is_archived: z.boolean(),
  created_at: z.date(),
  workspace_id: z.uuid('Invalid UUID format'),
});

export const WorkspaceIdParamsSchema = z.object({
  workspace_id: z.uuid('Invalid UUID format'),
});

export const ChannelIdParamsSchema = z.object({
  channel_id: z.uuid('Invalid UUID format'),
});

export type createChannelInput = z.infer<typeof ChannelCreateSchema>;
export type updateChannelInput = z.infer<typeof ChannelUpdateSchema>