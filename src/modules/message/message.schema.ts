import { z } from 'zod'

export const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
  parent_msg_id: z.string().uuid('Invalid UUID format').optional(),
})

export const EditMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
})

export type SendMessageInput = z.infer<typeof SendMessageSchema>
export type EditMessageInput = z.infer<typeof EditMessageSchema>
