import { Router } from 'express'
import { createExamination } from './controllers/create-examination'
import { resWrapper } from '@/utils/response'

const router = Router()

// POST /chalk/create/examination - 触发智能组卷采集
router.post('/create/examination', (req, res) => {
  resWrapper(createExamination, req, res)
})

router.get('/create/examination', (req, res) => {
  resWrapper(createExamination, req, res)
})

export default router
