import express from 'express';
import * as ChalkController from '@/controller/chalk'
import { ResWrapper } from '@/models/response'

const router = express.Router();


// 生成一套智能组题JS
router.get('/create/examination', function (req, res) {
    ResWrapper(ChalkController.createExamination, req, res)
});

export default router
