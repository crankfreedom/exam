import { Router } from 'express'
import { useCreateSmartPaper } from './controllers/create-smart-paper'
import { resWrapper } from '@/utils/response'

const router = Router()

// POST /chalk/create/smart-paper - 触发智能组卷采集
router.post('/create/smart-paper', (req, res) => {
  resWrapper(useCreateSmartPaper, req, res)
})

router.get('/create/smart-paper', (req, res) => {
  resWrapper(useCreateSmartPaper, req, res)
})

export default router
