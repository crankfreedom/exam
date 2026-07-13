import type { Request, Response } from 'express'

export interface ApiResponse<T = unknown> {
  code: string
  message: string
  data: T | null
}

interface SuccessResData {
  message: string
  data: unknown
}

interface FailResData {
  code: string
  message: string
}

export function successRes({ message, data }: SuccessResData): ApiResponse {
  return { code: '000000', message, data }
}

export function failRes({ code, message }: FailResData): ApiResponse<null> {
  return { code, message, data: null }
}

type RequestHandler = (req: Request, res: Response) => Promise<ApiResponse> | ApiResponse

/** 统一包装 Controller：执行 handler 并发送响应，捕获异常并返回错误码 */
export async function resWrapper(handler: RequestHandler, req: Request, res: Response,): Promise<void> {
  try {
    const result = await handler(req, res)
    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '服务内部错误'
    console.error('[Response Error]', message)
    res.json(failRes({ code: '000001', message: '服务内部错误' }))
  }
}
