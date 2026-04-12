import { z } from "zod"

export const WorkspaceStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);



export const WorkspaceCreateSchema = z.object({
  name: z.string().min(1, 'Workspace name cannot be empty'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug cannot be empty'),
});

export const WorkspaceUpdateSchema = z.object({
  name: z.string().min(1, 'Workspace name cannot be empty').optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  status: WorkspaceStatusSchema.optional(),
});

export const WorkspaceParamsSchemaWId = z.object({
  workspace_id: z.uuid('Invalid UUID format'),
});

export const WorkspaceParamsSchemaSlug = z.object({
  slug: z.string()
})

export const WorkspaceSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date(),
  status: WorkspaceStatusSchema,
});

export type createWorkspaceInput = z.infer<typeof WorkspaceCreateSchema>;
export type updateWorkspaceInput = z.infer<typeof WorkspaceUpdateSchema>;