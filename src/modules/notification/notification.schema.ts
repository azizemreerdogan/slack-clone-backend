import { z } from "zod";
import { EntityType, NotificationType } from "../../../generated/prisma/enums.js";

export const EntityTypeSchema = z.enum(EntityType);
export const NotificationTypeSchema = z.enum(NotificationType);

export const NotificationCreateSchema = z.object({
  workspace_member_id: z.uuid('Invalid UUID format'),
  entity_type: EntityTypeSchema,
  entity_id: z.string().optional(),
  notification_type: NotificationTypeSchema,
});

export const NotificationUpdateSchema = z.object({
  is_read: z.boolean().optional(),
});

export const NotificationParamsUserIdSchema = z.object({
  user_id: z.string(),
})

export const NotificationParamsNotifIdSchema = z.object({
  notification_id: z.string(),
})

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
export type updateNotificationInput = z.infer<typeof NotificationUpdateSchema>;
export type userIdParamsNotificationInput = z.infer<typeof NotificationParamsUserIdSchema>;
export type notifIdParamsNotificationInput = z.infer<typeof NotificationParamsNotifIdSchema>;
