import type { Request, Response, NextFunction } from 'express'

/** 请求日志中间件 */
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const { method, originalUrl, query, body } = req
  const detail = JSON.stringify({ query, body })
  console.log(`[Middleware] ${method} ${originalUrl} ${detail}`)
  next()
}
