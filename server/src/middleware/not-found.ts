import type { Request, Response } from 'express'
import { failRes } from '@/utils/response'
import { CODE } from '@/utils/code'

/** 404 兜底中间件 */
export function notFound(req: Request, res: Response): void {
  const { method, originalUrl } = req
  console.log(`[NotFound] ${method} ${originalUrl}`)
  res.json(failRes({ code: CODE.INTERNAL_ERROR, message: `${method} ${originalUrl} not found` }))
}
