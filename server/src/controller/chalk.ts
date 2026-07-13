import * as AccessChalk from '@/access/chalk'
import { successRes, failRes } from '@/models/response'


// 生成一套完整试卷
export async function createExamination(req: any, res: any) {
    const { num = 1 } = req.body || {};
    const data = await AccessChalk.createExamination({ num })
    res.json(successRes({ message: '请求成功', data }));
}
