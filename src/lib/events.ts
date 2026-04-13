import { EventEmitter } from 'node:events'

// ---- Event payload types ----

export interface MessageCreatedEvent {
  message_id: string
  channel_id: string
  sender_id: string
  content: string | null
  parent_msg_id: string | null
}

export interface MessageEditedEvent {
  message_id: string
  channel_id: string
}

export interface MessageDeletedEvent {
  message_id: string
  channel_id: string
}

// ---- Event map ----

export interface EventMap {
  'message.created': MessageCreatedEvent
  'message.edited': MessageEditedEvent
  'message.deleted': MessageDeletedEvent
}

// ---- Typed bus ----

class TypedEventBus {
  private emitter = new EventEmitter()

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.emitter.emit(event, payload)
  }

  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void {
    this.emitter.on(event, handler as (...args: unknown[]) => void)
  }

  off<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void {
    this.emitter.off(event, handler as (...args: unknown[]) => void)
  }
}

export const bus = new TypedEventBus()
