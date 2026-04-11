import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error({ err: error }, 'request failed');

  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }

  if (error instanceof Error) {
    const statusCode = (error as any).statusCode || 401;
    return reply.code(statusCode).send({
      error: {
        message: error.message,
        code: (error as any).code || 'ERROR',
      },
    });
  }

  // Unexpected errors
  reply.code(500).send({
    error: {
      message: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    },
  });
};
