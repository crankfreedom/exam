import express from 'express';

const router = express.Router();


// 生成一套智能组题JS
router.all('*', function (req: express.Request, res: express.Response, next) {
    MiddleWare_INFO(req)
    next()
});

function MiddleWare_INFO(req: express.Request) {
    // 输出访问url, method, params, body等信息

    const { method, originalUrl, query, body } = req
    console.log(`[MiddleWare] ${method} ${originalUrl}`, `{
        query: ${JSON.stringify(query)},
        body: ${JSON.stringify(body)},
    }`)
}

export default router
