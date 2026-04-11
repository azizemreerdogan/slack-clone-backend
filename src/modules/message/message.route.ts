import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { requireWorkspaceMember } from '../../middleware/requireWorkspaceMember.js'
import {
  SendMessageSchema,
  EditMessageSchema,
  ChannelMessagesParamsSchema,
  MessageParamsSchema,
} from './message.schema.js'
import {
  sendMessageHandler,
  editMessageHandler,
  deleteMessageHandler,
  getChannelMessagesHandler,
  getMessageRepliesHandler,
} from './message.controller.js'

export async function messageRoutes(server: FastifyInstance) {
  // GET /messages/:workspace_id/channels/:channel_id
  server.get('/:workspace_id/channels/:channel_id', {
    schema: {
      params: ChannelMessagesParamsSchema,
    },
    handler: getChannelMessagesHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // POST /messages/:workspace_id/channels/:channel_id
  server.post('/:workspace_id/channels/:channel_id', {
    schema: {
      body: SendMessageSchema,
      params: ChannelMessagesParamsSchema,
    },
    handler: sendMessageHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // PATCH /messages/:workspace_id/channels/:channel_id/:message_id
  server.patch('/:workspace_id/channels/:channel_id/:message_id', {
    schema: {
      body: EditMessageSchema,
      params: MessageParamsSchema,
    },
    handler: editMessageHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // DELETE /messages/:workspace_id/channels/:channel_id/:message_id
  server.delete('/:workspace_id/channels/:channel_id/:message_id', {
    schema: {
      params: MessageParamsSchema,
    },
    handler: deleteMessageHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // GET /messages/:workspace_id/channels/:channel_id/:message_id/replies
  server.get('/:workspace_id/channels/:channel_id/:message_id/replies', {
    schema: {
      params: MessageParamsSchema,
    },
    handler: getMessageRepliesHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })
}
