import { z } from "zod";
import { EventEmitter } from "node:events";
import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { EntityType, NotificationType } from "../../generated/prisma/enums.js";
import { ca } from "zod/v4/locales";


export const eventSchemas = {
  "message.created": z.object({
    message_id: z.string(),
    channel_id: z.string(),
    sender_id: z.string(),
    content: z.string().nullable(),
    parent_msg_id: z.string().nullable(),
  }),
  "message.edited": z.object({ message_id: z.string(), channel_id: z.string() }),
  "message.deleted": z.object({ message_id: z.string(), channel_id: z.string() }),
  "notification.created": z.object({
    notification_id: z.string(),
    user_id: z.string(),
    workspace_member_id: z.string(),
    entity_type: z.enum(EntityType),
    entity_id: z.string().nullable(),
    notification_type: z.enum(NotificationType),
    created_at: z.string().nullable(),
    is_read: z.boolean(),
  }),
  "notification.read": z.object({
    notification_id: z.string(),
    user_id: z.string(),
    workspace_member_id: z.string(),
    created_at: z.date().nullable()
   }),
   "notification.all_read": z.object({
    user_id: z.string(),
    workspace_member_id: z.string(),
   }),
   "call.invite": z.object({
      call_id: z.string(),
      sender_id: z.string(),
      recipients: z.array(z.string()),
      workspace_member_id: z.string(),
      created_at: z.date().nullable(),
   }),
   "call.accept": z.object({
      call_id: z.string(),
      user_id: z.string(),
      workspace_member_id: z.string()
   }),
   "call.decline": z.object({
      call_id: z.string(),
      user_id: z.string(),
      workspace_member_id: z.string(),
   }),
   "call.leave": z.object({
      call_id: z.string(),
      user_id: z.string(),
      created_at: z.date().nullable()
   }),
   "call.ended": z.object({
      call_id: z.string(),
      sender_id: z.string(),
      recipients: z.array(z.string()),
      workspace_member_id: z.string(),
      ended_at: z.date().nullable(),
   })
   
} as const;

export type EventMap = {
  [K in keyof typeof eventSchemas]: z.infer<(typeof eventSchemas)[K]>;
};

export type MessageCreatedEvent = EventMap["message.created"];

const pub = new Redis(env.REDIS_URL);
const sub = new Redis(env.REDIS_URL);
const emitter = new EventEmitter();

sub.on("message", (channel, raw) => {
  const schema = eventSchemas[channel as keyof typeof eventSchemas];
  if (!schema) return;
  const parsed = schema.safeParse(JSON.parse(raw));
  if (!parsed.success) return; // drift/garbage
  emitter.emit(channel, parsed.data);
});

class TypedEventBus {
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    pub.publish(event, JSON.stringify(payload));
  }
  on<K extends keyof EventMap>(event: K, handler: (p: EventMap[K]) => void) {
    if (emitter.listenerCount(event) === 0) sub.subscribe(event);
    emitter.on(event, handler as (...a: unknown[]) => void);
  }
  off<K extends keyof EventMap>(event: K, handler: (p: EventMap[K]) => void) {
    emitter.off(event, handler as (...a: unknown[]) => void);
  }
}

export const bus = new TypedEventBus();
