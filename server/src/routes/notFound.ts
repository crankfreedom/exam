import express from 'express';
import { failRes } from '@/models/response';
import { CODE } from '@/dict/code'


const router = express.Router();


// 生成一套智能组题JS
router.all('*', function (req: express.Request, res: express.Response) {
    notFound(req, res)
});

function notFound(req: express.Request, res: express.Response) {
    // 输出访问url, method, params, body等信息

    const { method, originalUrl, query, body } = req
    console.log(`[MiddleWare] ${method} ${originalUrl}`, `{
        query: ${JSON.stringify(query)},
        body: ${JSON.stringify(body)},
    }`)
    res.json(failRes({ code: CODE.NOTFOUND, message: `${method} ${originalUrl} not found` }))
}

export default router
