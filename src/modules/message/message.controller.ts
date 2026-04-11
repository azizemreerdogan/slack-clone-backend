import type { FastifyReply, FastifyRequest } from 'fastify'
import type { SendMessageInput, EditMessageInput } from './message.schema.js'
import {
  sendMessage,
  editMessage,
  deleteMessage,
  getChannelMessages,
  getMessageReplies,
} from './message.service.js'

export async function sendMessageHandler(
  request: FastifyRequest<{
    Body: SendMessageInput
    Params: { workspace_id: string; channel_id: string }
  }>,
  reply: FastifyReply,
) {
  const sender_id = request.workspaceMember!.id
  const { channel_id } = request.params

  try {
    const message = await sendMessage(request.body, channel_id, sender_id)
    return reply.code(201).send({ message })
  } catch (error) {
    throw error
  }
}

export async function editMessageHandler(
  request: FastifyRequest<{
    Body: EditMessageInput
    Params: { workspace_id: string; channel_id: string; message_id: string }
  }>,
  reply: FastifyReply,
) {
  const sender_id = request.workspaceMember!.id
  const { message_id } = request.params

  try {
    const message = await editMessage(request.body, message_id, sender_id)
    return reply.code(200).send({ message })
  } catch (error) {
    throw error
  }
}

export async function deleteMessageHandler(
  request: FastifyRequest<{
    Params: { workspace_id: string; channel_id: string; message_id: string }
  }>,
  reply: FastifyReply,
) {
  const sender_id = request.workspaceMember!.id
  const { message_id } = request.params

  try {
    const message = await deleteMessage(message_id, sender_id)
    return reply.code(200).send({ message })
  } catch (error) {
    throw error
  }
}

export async function getChannelMessagesHandler(
  request: FastifyRequest<{
    Params: { workspace_id: string; channel_id: string }
  }>,
  reply: FastifyReply,
) {
  const { channel_id } = request.params

  try {
    const messages = await getChannelMessages(channel_id)
    return reply.code(200).send({ messages })
  } catch (error) {
    throw error
  }
}

export async function getMessageRepliesHandler(
  request: FastifyRequest<{
    Params: { workspace_id: string; channel_id: string; message_id: string }
  }>,
  reply: FastifyReply,
) {
  const { message_id } = request.params

  try {
    const messages = await getMessageReplies(message_id)
    return reply.code(200).send({ messages })
  } catch (error) {
    throw error
  }
}
