import { z } from 'zod'
import { AttachStatus } from '../../../generated/prisma/enums.js'

export const AttachStatusSchema = z.enum(AttachStatus)

export const CreatePresignedUploadSchema = z.object({
  filename: z.string().min(1, 'Filename cannot be empty'),
  mime: z.string().min(1, 'Mime type cannot be empty'),
  size: z.number().int().positive('Size must be a positive integer'),
})

export const WorkspaceParamsSchema = z.object({
  workspace_id: z.uuid('Invalid UUID format'),
})

export const AttachmentParamsSchema = z.object({
  workspace_id: z.uuid('Invalid UUID format'),
  attachment_id: z.uuid('Invalid UUID format'),
})

export const AttachmentSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  filename: z.string(),
  workspace_id: z.uuid('Invalid UUID format'),
  uploader_member_id: z.uuid('Invalid UUID format'),
  message_id: z.uuid('Invalid UUID format').nullable(),
  storage_key: z.string(),
  mime: z.string(),
  size: z.number().int(),
  attach_status: AttachStatusSchema,
  created_at: z.date(),
})

export type CreatePresignedUploadInput = z.infer<typeof CreatePresignedUploadSchema>
export type WorkspaceParamsInput = z.infer<typeof WorkspaceParamsSchema>
export type AttachmentParamsInput = z.infer<typeof AttachmentParamsSchema>
