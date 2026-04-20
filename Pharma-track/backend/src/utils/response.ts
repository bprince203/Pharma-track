import type { Response } from 'express'

export const success = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const error = (
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  errors: Record<string, string[]> | null = null
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  })
}
