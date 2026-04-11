import type { FastifyInstance } from 'fastify'
import { authenticate } from '../../middleware/authenticate.js'
import { requireWorkspaceMember } from '../../middleware/requireWorkspaceMember.js'
import { SendMessageSchema, EditMessageSchema } from './message.schema.js'
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
      params: {
        type: 'object',
        properties: {
          workspace_id: { type: 'string' },
          channel_id: { type: 'string' },
        },
        required: ['workspace_id', 'channel_id'],
      },
    },
    handler: getChannelMessagesHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // POST /messages/:workspace_id/channels/:channel_id
  server.post('/:workspace_id/channels/:channel_id', {
    schema: {
      body: SendMessageSchema,
      params: {
        type: 'object',
        properties: {
          workspace_id: { type: 'string' },
          channel_id: { type: 'string' },
        },
        required: ['workspace_id', 'channel_id'],
      },
    },
    handler: sendMessageHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // PATCH /messages/:workspace_id/channels/:channel_id/:message_id
  server.patch('/:workspace_id/channels/:channel_id/:message_id', {
    schema: {
      body: EditMessageSchema,
      params: {
        type: 'object',
        properties: {
          workspace_id: { type: 'string' },
          channel_id: { type: 'string' },
          message_id: { type: 'string' },
        },
        required: ['workspace_id', 'channel_id', 'message_id'],
      },
    },
    handler: editMessageHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // DELETE /messages/:workspace_id/channels/:channel_id/:message_id
  server.delete('/:workspace_id/channels/:channel_id/:message_id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          workspace_id: { type: 'string' },
          channel_id: { type: 'string' },
          message_id: { type: 'string' },
        },
        required: ['workspace_id', 'channel_id', 'message_id'],
      },
    },
    handler: deleteMessageHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })

  // GET /messages/:workspace_id/channels/:channel_id/:message_id/replies
  server.get('/:workspace_id/channels/:channel_id/:message_id/replies', {
    schema: {
      params: {
        type: 'object',
        properties: {
          workspace_id: { type: 'string' },
          channel_id: { type: 'string' },
          message_id: { type: 'string' },
        },
        required: ['workspace_id', 'channel_id', 'message_id'],
      },
    },
    handler: getMessageRepliesHandler,
    preHandler: [authenticate, requireWorkspaceMember],
  })
}
