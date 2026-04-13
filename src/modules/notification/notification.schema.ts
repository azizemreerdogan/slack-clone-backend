import { z } from "zod";

export const EntityTypeSchema = z.enum(['TASK', 'MESSAGE', 'INVITATION']);
export const NotificationTypeSchema = z.enum(['DM_RECEIVED', 'MESSAGE_MENTION', 'THREAD_REPLY', 'TASK_ASSIGNED', 'INVITE_RECEIVED']);

export const NotificationCreateSchema = z.object({
  workspace_member_id: z.uuid('Invalid UUID format'),
  entity_type: EntityTypeSchema,
  entity_id: z.string().optional(),
  notification_type: NotificationTypeSchema,
});

export const NotificationUpdateSchema = z.object({
  is_read: z.boolean().optional(),
});

export const NotificationSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  workspace_member_id: z.uuid('Invalid UUID format'),
  entity_type: EntityTypeSchema,
  entity_id: z.string().nullable(),
  notification_type: NotificationTypeSchema,
  created_at: z.date().nullable(),
  is_read: z.boolean(),
});


export type createNotificationInput = z.infer<typeof NotificationCreateSchema>;