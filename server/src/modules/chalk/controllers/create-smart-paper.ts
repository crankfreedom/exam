import type { Request, Response } from 'express'
import { createSmartPaper } from '../services/chalk-crawler'
import { successRes, failRes, type ApiResponse } from '@/utils/response'
import { CODE } from '@/utils/code'

/** POST /chalk/create/smartpaper */
export async function useCreateSmartPaper(req: Request, _res: Response): Promise<ApiResponse> {
  const { num = 1 } = req.query
  const count = Number(num)
  if (!Number.isInteger(count) || count < 1) return failRes({ code: CODE.PARAM_INVALID, message: '参数 num 必须为正整数' })
  await createSmartPaper({ num: count })
  return successRes({ message: '采集任务已完成', data: null })
}
