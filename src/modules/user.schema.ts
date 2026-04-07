import { z } from 'zod';

// =============================================
// ENUM Schemas
// =============================================

export const UserPresenceStatusSchema = z.enum(['ONLINE', 'OFFLINE', 'AWAY', 'DO_NOT_DISTURB']);
export const UserCreationStatusSchema = z.enum(['ACTIVE', 'LOCKED', 'DISABLED']);
export const WorkspaceStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const MemberStatusSchema = z.enum(['ONLINE', 'OFFLINE', 'IDLE']);
export const RoleTypeSchema = z.enum(['ADMIN', 'OWNER', 'MEMBER']);
export const ChannelTypeSchema = z.enum(['PUBLIC', 'PRIVATE', 'DM', 'GROUP_DM']);
export const NotificationTypeSchema = z.enum(['DM_RECEIVED', 'MESSAGE_MENTION', 'THREAD_REPLY', 'TASK_ASSIGNED', 'INVITE_RECEIVED']);
export const EntityTypeSchema = z.enum(['TASK', 'MESSAGE', 'INVITATION']);

// =============================================
// User Schema
// =============================================

export const UserCreateSchema = z.object({
  name: z.string().optional(),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  is_email_verified: z.boolean().optional(),
  user_presence_status: UserPresenceStatusSchema.optional(),
  user_creation_status: UserCreationStatusSchema.optional(),
});

export const UserSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  name: z.string().nullable(),
  email: z.email('Invalid email address'),
  password: z.string(),
  is_email_verified: z.boolean(),
  created_at: z.date().nullable(),
  updated_at: z.date(),
  user_presence_status: UserPresenceStatusSchema.nullable(),
  user_creation_status: UserCreationStatusSchema.nullable(),
});


export const UserLoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string()
})


export const UserRegisterResponseSchema = z.object({
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    name: z.string()
  }),
  token: z.string()
})

export const UserLoginResponseSchema = z.object({
  token: z.string()
})


//TODO: MOVE THESE SCHEMA'S TO RELATED FOLDERS ONLY USER SCHEMAS SHOULD STAY 


// =============================================
// Workspace Schema
// =============================================

export const WorkspaceCreateSchema = z.object({
  name: z.string().min(1, 'Workspace name cannot be empty'),
  description: z.string().optional(),
  slug: z.string().optional(),
});

export const WorkspaceUpdateSchema = z.object({
  name: z.string().min(1, 'Workspace name cannot be empty').optional(),
  description: z.string().optional(),
  slug: z.string().optional(),
  status: WorkspaceStatusSchema.optional(),
});

export const WorkspaceSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string().nullable(),
  created_at: z.date().nullable(),
  updated_at: z.date(),
  status: WorkspaceStatusSchema,
});

// =============================================
// WorkspaceMember Schema
// =============================================

export const WorkspaceMemberCreateSchema = z.object({
  user_id: z.uuid('Invalid UUID format'),
  workspace_id: z.uuid('Invalid UUID format'),
  role: RoleTypeSchema.optional(),
  display_name: z.string().optional(),
  member_status: MemberStatusSchema.optional(),
});

export const WorkspaceMemberUpdateSchema = z.object({
  role: RoleTypeSchema.optional(),
  display_name: z.string().optional(),
  member_status: MemberStatusSchema.optional(),
});

export const WorkspaceMemberSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  user_id: z.uuid('Invalid UUID format'),
  workspace_id: z.uuid('Invalid UUID format'),
  role: RoleTypeSchema.nullable(),
  display_name: z.string().nullable(),
  member_status: MemberStatusSchema.nullable(),
  joined_at: z.date().nullable(),
});

// =============================================
// Channel Schema
// =============================================

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

// =============================================
// ChannelMember Schema
// =============================================

export const ChannelMemberCreateSchema = z.object({
  channel_id: z.uuid('Invalid UUID format'),
  workspace_member_id: z.uuid('Invalid UUID format'),
});

export const ChannelMemberSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  channel_id: z.uuid('Invalid UUID format'),
  workspace_member_id: z.uuid('Invalid UUID format'),
});

// =============================================
// Message Schema
// =============================================

export const MessageCreateSchema = z.object({
  channel_id: z.uuid('Invalid UUID format'),
  sender_id: z.uuid('Invalid UUID format'),
  content: z.string().min(1, 'Message cannot be empty'),
  parent_msg_id: z.uuid('Invalid UUID format').optional(),
});

export const MessageUpdateSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
});

export const MessageSchema = z.object({
  id: z.uuid('Invalid UUID format'),
  channel_id: z.uuid('Invalid UUID format'),
  sender_id: z.uuid('Invalid UUID format'),
  content: z.string().nullable(),
  parent_msg_id: z.string().nullable(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  created_at: z.date().nullable(),
  edited_at: z.date().nullable(),
});

// =============================================
// Notification Schema
// =============================================

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

export type createUserInput = z.infer<typeof UserCreateSchema>;
export type loginUserHandler = z.infer<typeof UserLoginSchema>;
export type userRegisterResponseSchema = z.infer<typeof UserRegisterResponseSchema>;
export type UserLoginResponseSchema = z.infer<typeof UserLoginResponseSchema>;