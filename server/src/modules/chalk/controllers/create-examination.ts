import type { Request, Response } from 'express'
import { createExamination as runCrawl } from '../services/chalk-crawler'
import { successRes, failRes, type ApiResponse } from '@/utils/response'
import { CODE } from '@/utils/code'

interface CreateExaminationBody {
  num?: number
}

/** POST /chalk/create/examination */
export async function createExamination(req: Request, _res: Response): Promise<ApiResponse> {
  const { num = 1 } = (req.body ?? {}) as CreateExaminationBody
  const count = Number(num)
  if (!Number.isInteger(count) || count < 1) {
    return failRes({ code: CODE.PARAM_INVALID, message: '参数 num 必须为正整数' })
  }
  await runCrawl({ num: count })
  return successRes({ message: '采集任务已完成', data: null })
}
