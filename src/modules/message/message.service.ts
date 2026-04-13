import type { SendMessageInput, EditMessageInput } from './message.schema.js'
import prisma from '../../lib/prisma.js'
import { AppError } from '../../errors/AppError.js'
import { Prisma } from '../../../generated/prisma/client.js'
import { bus } from '../../lib/events.js'


export async function sendMessage(
  input: SendMessageInput,
  channel_id: string,
  sender_id: string,
) {
  const channel = await prisma.channel.findUnique({ where: { id: channel_id } })
  if (!channel) {
    throw new AppError(404, 'Channel not found')
  }

  //When replying to a message
  if (input.parent_msg_id) {
    const parent = await prisma.message.findUnique({ where: { id: input.parent_msg_id } })
    if (!parent) {
      throw new AppError(404, 'Parent message not found')
    }
    if (parent.parent_msg_id) {
      throw new AppError(400, 'Cannot reply to a reply — threading is limited to 1 level deep')
    }
    if (parent.channel_id !== channel_id) {
      throw new AppError(400, 'Parent message does not belong to this channel')
    }
  }

  const message = await prisma.message.create({
    data: {
      channel_id,
      sender_id,
      content: input.content,
      parent_msg_id: input.parent_msg_id ?? null,
      created_at: new Date(),
    },
  })
  
  //Created message event is emitted after db write.
  bus.emit("message.created",{
    message_id: message.id,
    channel_id: channel_id,
    sender_id: sender_id,
    content: message.content,
    parent_msg_id: message.parent_msg_id ?? null
  });

}


export async function editMessage(
  input: EditMessageInput,
  message_id: string,
  sender_id: string,
) {
  let message;
  try {
    message = await prisma.message.findUniqueOrThrow({ where: { id: message_id } })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new AppError(404, 'Message not found')
    }
    throw e
  }

  if (message.is_deleted) {
    throw new AppError(400, 'Cannot edit a deleted message')
  }
  if (message.sender_id !== sender_id) {
    throw new AppError(403, 'You can only edit your own messages')
  }

  return await prisma.message.update({
    where: { id: message_id },
    data: {
      content: input.content,
      is_edited: true,
      edited_at: new Date(),
    },
  })
}

export async function deleteMessage(message_id: string, sender_id: string) {
  let message;
  try {
    message = await prisma.message.findUniqueOrThrow({ where: { id: message_id } })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new AppError(404, 'Message not found')
    }
    throw e
  }

  if (message.is_deleted) {
    throw new AppError(400, 'Message is already deleted')
  }
  if (message.sender_id !== sender_id) {
    throw new AppError(403, 'You can only delete your own messages')
  }

  return await prisma.message.update({
    where: { id: message_id },
    data: { is_deleted: true },
  })
}

export async function getChannelMessages(channel_id: string) {
  const channel = await prisma.channel.findUnique({ where: { id: channel_id } })
  if (!channel) {
    throw new AppError(404, 'Channel not found')
  }

  return await prisma.message.findMany({
    where: { channel_id, parent_msg_id: null },
    orderBy: { created_at: 'asc' },
  })
}

export async function getMessageReplies(message_id: string) {
  let message;
  try {
    message = await prisma.message.findUniqueOrThrow({ where: { id: message_id } })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new AppError(404, 'Message not found')
    }
    throw e
  }

  if (message.parent_msg_id) {
    throw new AppError(400, 'Cannot fetch replies of a reply')
  }

  return await prisma.message.findMany({
    where: { parent_msg_id: message_id },
    orderBy: { created_at: 'asc' },
  })
}
