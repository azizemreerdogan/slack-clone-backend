import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: {
        message: error.message,
        code: error.code,
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
