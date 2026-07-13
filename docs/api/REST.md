# ExamHub RESTful API 设计

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13
> **基础 URL：** /api

---

## 一、API 设计规范

### 1.1 通用约定

| 规范 | 规则 |
|------|------|
| 基础路径 | /api/v1（V1 版本） |
| 请求体 | JSON (Content-Type: application/json) |
| 响应体 | 统一 JSON 包装 |
| 认证 | JWT Bearer Token（Header: Authorization: Bearer {token}） |
| 分页 | ?page=1&pageSize=20 |
| 排序 | ?sort=created_at&order=desc |
| 筛选 | ?examType=国考&year=2024 |

### 1.2 统一响应格式

所有接口统一返回 HTTP 200，业务状态码通过响应体中的 `code` 字段区分。

`json
// 成功
{
  "code": "000000",
  "message": "success",
  "data": { ... }
}

// 列表成功（含分页）
{
  "code": "000000",
  "message": "success",
  "data": {
    "items": [...],
    "total": 156,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}

// 业务错误
{
  "code": "40001",
  "message": "参数校验失败",
  "data": null
}
`

### 1.3 业务状态码参考

以下是业务状态码的语义参考，实际 HTTP 状态统一为 200：

| code | 含义 | 说明 |
|------|------|------|
| 000000 | 请求成功 | — |
| 4xxxxx | 客户端错误 | 参数校验、认证、权限等 |
| 5xxxxx | 服务端错误 | 服务器内部错误、超时等 |

---

## 二、内容中心 API

### 2.1 Question（题目）

`
GET    /api/v1/questions             列表查询
GET    /api/v1/questions/:id         获取单题
POST   /api/v1/questions             新建题目
PUT    /api/v1/questions/:id         更新题目
DELETE /api/v1/questions/:id         逻辑删除
`

**GET /api/v1/questions**

Query 参数：

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| examType | string | N | 考试类型 |
| year | int | N | 年份 |
| region | string | N | 地区 |
| subject | string | N | 科目 |
| difficulty | string | N | 难度 |
| source | string | N | 来源 |
| type | string | N | 题型 |
| status | string | N | 状态，默认 published |
| keyword | string | N | 关键词搜索 |
| page | int | N | 页码，默认 1 |
| pageSize | int | N | 每页条数，默认 20 |

响应示例：

`json
{
  "code": "000000",
  "message": "success",
  "data": {
    "items": [
      {
        "id": "Q000001",
        "type": "single_choice",
        "content": "以下哪项最符合文意？",
        "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "difficulty": "medium",
        "examType": "national",
        "year": 2024
      }
    ],
    "total": 200,
    "page": 1,
    "pageSize": 20,
    "totalPages": 10
  }
}
`

**POST /api/v1/questions**

`json
{
  "type": "single_choice",
  "content": "以下哪项最符合文意？",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "A",
  "analysis": "根据文章第 X 段…",
  "difficulty": "medium",
  "examType": "national",
  "year": 2024,
  "subject": "行测"
}
`

### 2.2 Paper（试卷）

`
GET    /api/v1/papers                列表查询
GET    /api/v1/papers/:id            试卷详情（含题目列表）
POST   /api/v1/papers                新建试卷
PUT    /api/v1/papers/:id            更新试卷信息
DELETE /api/v1/papers/:id            逻辑删除

POST   /api/v1/papers/:id/questions          添加题目
PUT    /api/v1/papers/:id/questions/reorder  重排题目顺序
DELETE /api/v1/papers/:id/questions/:questionId  移除题目
PUT    /api/v1/papers/:id/sections           更新分部分结构

GET    /api/v1/papers/:id/preview    预览试卷
GET    /api/v1/papers/:id/export     导出试卷 JSON
`

**GET /api/v1/papers/:id** 响应：

`json
{
  "code": "000000",
  "message": "success",
  "data": {
    "id": "P000001",
    "title": "2024 国考行测真题",
    "examType": "national",
    "year": 2024,
    "totalQuestions": 135,
    "duration": 120,
    "sections": [
      {
        "title": "第一部分 言语理解",
        "questionCount": 25,
        "startIndex": 0,
        "questions": [
          {
            "id": "Q000001",
            "sortOrder": 0,
            "score": 1,
            "content": "...",
            "options": { "A": "...", "B": "...", "C": "...", "D": "..." }
          }
        ]
      }
    ],
    "version": 2,
    "status": "published"
  }
}
`

### 2.3 Collection（合集）

`
GET    /api/v1/collections           列表查询
GET    /api/v1/collections/:id       合集详情（含试卷列表）
POST   /api/v1/collections           新建合集
PUT    /api/v1/collections/:id       更新合集
DELETE /api/v1/collections/:id       逻辑删除

POST   /api/v1/collections/:id/papers          添加试卷
PUT    /api/v1/collections/:id/papers/reorder  重排试卷顺序
DELETE /api/v1/collections/:id/papers/:paperId 移除试卷
`

### 2.4 Material（材料）

`
GET    /api/v1/materials             列表
GET    /api/v1/materials/:id         详情
POST   /api/v1/materials             新建
PUT    /api/v1/materials/:id         更新
DELETE /api/v1/materials/:id         删除
`

### 2.5 版本历史

`
GET    /api/v1/versions/:resourceType/:id         版本历史列表
GET    /api/v1/versions/:resourceType/:id/:version 获取特定版本内容
POST   /api/v1/versions/:resourceType/:id/rollback  回滚到指定版本
GET    /api/v1/versions/:resourceType/:id/diff     对比版本差异
`

---

## 三、搜索 API

`
GET    /api/v1/search                 综合搜索
GET    /api/v1/search/suggest         搜索建议（自动补全）
GET    /api/v1/category/filters       获取筛选选项
`

**GET /api/v1/search**

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| q | string | N | 关键词 |
| type | string | N | 资源类型：paper / collection / product |
| examType | string | N | 考试类型筛选 |
| year | int | N | 年份筛选 |
| region | string | N | 地区筛选 |
| subject | string | N | 科目筛选 |
| difficulty | string | N | 难度筛选 |
| priceMin | decimal | N | 最低价格 |
| priceMax | decimal | N | 最高价格 |
| sort | string | N | latest / popular / price_asc / price_desc / relevance |
| page | int | N | 页码 |
| pageSize | int | N | 每页条数 |

响应：

`json
{
  "code": "000000",
  "message": "success",
  "data": {
    "main": {
      "items": [...],
      "total": 85
    },
    "secondary": {
      "news": [],
      "knowledge": []
    }
  }
}
`

---

## 四、商品 API

`
GET    /api/v1/products              列表查询（仅 published）
GET    /api/v1/products/:id          商品详情
GET    /api/v1/products/:id/contents 获取关联内容（用于试看）
`

**GET /api/v1/products**

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| examType | string | N | 考试类型 |
| type | string | N | 商品类型 |
| priceMin | decimal | N | 最低价格 |
| priceMax | decimal | N | 最高价格 |
| isFree | boolean | N | 是否免费 |
| isFlashSale | boolean | N | 是否限时活动 |
| sort | string | N | latest / popular / price_asc |
| page | int | N | 页码 |
| pageSize | int | N | 每页条数 |

---

## 五、订单 API

`
POST   /api/v1/orders                创建订单
GET    /api/v1/orders                我的订单列表
GET    /api/v1/orders/:id            订单详情
POST   /api/v1/orders/:id/pay        发起支付
POST   /api/v1/orders/:id/cancel     取消订单

// 支付回调（微信）
POST   /api/v1/payment/wechat/notify 微信支付回调
`

**POST /api/v1/orders**

`json
{
  "productId": "PR000001",
  "quantity": 1,
  "paymentMethod": "wechat"
}
`

响应：

`json
{
  "code": "000000",
  "message": "success",
  "data": {
    "orderId": "O000001",
    "orderNo": "20240710XXXXX",
    "payAmount": 9.90,
    "payUrl": "weixin://…",
    "qrcodeUrl": "https://…"
  }
}
`

---

## 六、下载 API

`
POST   /api/v1/download/token        请求 DownloadToken
GET    /api/v1/download/pdf          下载 PDF（带 Token）
GET    /api/v1/download/history      下载历史
GET    /api/v1/download/remain       剩余下载次数
`

**POST /api/v1/download/token**

`json
// Request
{ "resourceId": "P000001", "resourceType": "paper" }

// Response
{
  "code": "000000",
  "message": "success",
  "data": {
    "token": "a1b2c3d4e5...",
    "expiresIn": 300,
    "fileInfo": {
      "fileName": "2024国考行测真题.pdf",
      "fileSize": 5242880
    }
  }
}
`

**GET /api/v1/download/pdf**

`
Query: ?token=a1b2c3d4e5...
Response: PDF 文件流
Content-Type: application/pdf
Content-Disposition: attachment; filename="2024国考行测真题.pdf"
X-Download-Count-Remain: 8
`

---

## 七、PDF API

`
GET    /api/v1/pdf/content/:resourceId  获取加密内容数据
GET    /api/v1/pdf/status/:resourceId   查询 PDF 生成状态
`

**GET /api/v1/pdf/content/:resourceId**

`json
{
  "code": "000000",
  "message": "success",
  "data": {
    "resourceId": "P000001",
    "version": 2,
    "encryptedData": "base64...",
    "iv": "base64...",
    "keyHint": "...",
    "watermarkInfo": {
      "username": "张**",
      "phone": "138****1234",
      "orderId": "O000001",
      "downloadTime": "2024-01-15 14:30:00"
    }
  }
}
`

---

## 八、用户 API

`
POST   /api/v1/auth/register              注册（手机号+密码）
POST   /api/v1/auth/login                 登录（手机号/邮箱+密码）
POST   /api/v1/auth/login/phone            手机验证码登录
POST   /api/v1/auth/login/wechat           微信扫码登录
POST   /api/v1/auth/refresh                刷新 Token
POST   /api/v1/auth/logout                 登出

GET    /api/v1/user/profile                获取个人信息
PUT    /api/v1/user/profile                更新个人信息
PUT    /api/v1/user/phone                  更换手机号
PUT    /api/v1/user/password               修改密码

GET    /api/v1/user/orders                 我的订单
GET    /api/v1/user/downloads              下载中心
GET    /api/v1/user/favorites              收藏列表
POST   /api/v1/user/favorites              添加收藏
DELETE /api/v1/user/favorites/:id          取消收藏
GET    /api/v1/user/history                浏览历史
POST   /api/v1/user/history                记录浏览（前端触发）

GET    /api/v1/user/vip                    我的 VIP 信息
POST   /api/v1/user/vip                    开通 VIP

GET    /api/v1/user/score                  我的积分
GET    /api/v1/user/score/history          积分明细
POST   /api/v1/user/score/sign-in          每日签到
`

---

## 九、运营 API

`
GET    /api/v1/news                       资讯列表
GET    /api/v1/news/:id                   资讯详情
GET    /api/v1/news/latest                最新资讯

GET    /api/v1/banners                    首页轮播列表
GET    /api/v1/links/official             官方网址列表
GET    /api/v1/links/friend               友情链接列表
GET    /api/v1/seo/info                   获取页面 SEO 信息
`

---

## 十、采集 API

```
POST   /chalk/create/examination        触发智能组卷采集
```

**POST /chalk/create/examination**

请求体：

```json
{
  "num": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| num | int | N | 采集套数，默认 1 |

响应：

```json
{
  "code": "000000",
  "message": "请求成功",
  "data": null
}
```

**说明：** 该接口为异步触发型。请求返回表示采集任务已在子进程中启动，完成后通过进程间通信通知主进程。仅管理员可调用。

---
## 十一、管理端 API

### 10.1 认证

`
POST   /api/v1/admin/login                管理员登录
POST   /api/v1/admin/logout               管理员登出
GET    /api/v1/admin/profile              管理员信息
`

### 10.2 仪表盘

`
GET    /api/v1/admin/dashboard            仪表盘数据
GET    /api/v1/admin/dashboard/orders     订单趋势
GET    /api/v1/admin/dashboard/top        热门资料 Top 10
`

### 10.3 内容管理

`
GET    /api/v1/admin/questions            题目管理列表
POST   /api/v1/admin/questions            新建题目
PUT    /api/v1/admin/questions/:id        编辑题目
DELETE /api/v1/admin/questions/:id        删除题目
POST   /api/v1/admin/questions/batch      批量操作

GET    /api/v1/admin/papers               试卷管理列表
POST   /api/v1/admin/papers               新建试卷
PUT    /api/v1/admin/papers/:id           编辑试卷
POST   /api/v1/admin/papers/:id/questions       添加题目
PUT    /api/v1/admin/papers/:id/questions/reorder 重排
DELETE /api/v1/admin/papers/:id            删除试卷

GET    /api/v1/admin/collections          合集管理列表
POST   /api/v1/admin/collections          新建合集
...

GET    /api/v1/admin/products             商品管理列表
POST   /api/v1/admin/products             新建商品
PUT    /api/v1/admin/products/:id         编辑商品
POST   /api/v1/admin/products/:id/publish  发布
POST   /api/v1/admin/products/:id/offline  下架
DELETE /api/v1/admin/products/:id          删除

GET    /api/v1/admin/pdfs                  PDF 管理列表
POST   /api/v1/admin/pdfs/generate        手动触发生成
POST   /api/v1/admin/pdfs/clear-cache     清除缓存
`

### 10.4 Importer

`
POST   /api/v1/admin/importer/upload           上传文件
GET    /api/v1/admin/importer/preview/:importId  获取预览
PUT    /api/v1/admin/importer/preview/:importId/question/:index  修改某题
DELETE /api/v1/admin/importer/preview/:importId/question/:index  删除某题
POST   /api/v1/admin/importer/confirm/:importId  确认导入
GET    /api/v1/admin/importer/history           导入历史
`

### 10.5 订单管理

`
GET    /api/v1/admin/orders               订单列表
GET    /api/v1/admin/orders/:id           订单详情
POST   /api/v1/admin/orders/:id/refund    发起退款
GET    /api/v1/admin/orders/export        导出订单
`

### 10.6 用户管理

`
GET    /api/v1/admin/users                用户列表
GET    /api/v1/admin/users/:id            用户详情
POST   /api/v1/admin/users/:id/vip        手动开通/续费 VIP
POST   /api/v1/admin/users/:id/ban        封禁
POST   /api/v1/admin/users/:id/unban      解封
PUT    /api/v1/admin/users/:id/score      调整积分
`

### 10.7 权限管理

`
GET    /api/v1/admin/roles                角色列表
POST   /api/v1/admin/roles                新建角色
PUT    /api/v1/admin/roles/:id            编辑角色
DELETE /api/v1/admin/roles/:id            删除角色

GET    /api/v1/admin/permissions          权限列表
POST   /api/v1/admin/permissions          新建权限
PUT    /api/v1/admin/permissions/:id      编辑权限

GET    /api/v1/admin/admin-users          管理员列表
POST   /api/v1/admin/admin-users          新建管理员
PUT    /api/v1/admin/admin-users/:id      编辑管理员
POST   /api/v1/admin/admin-users/:id/roles  分配角色
`

### 10.8 系统设置

`
GET    /api/v1/admin/settings             获取所有配置
PUT    /api/v1/admin/settings/:key        更新配置
GET    /api/v1/admin/settings/:key        获取单项配置

GET    /api/v1/admin/logs                 操作日志
GET    /api/v1/admin/logs/export          导出日志
`

---

## 十二、通用组件 API

`
// 图片上传
POST   /api/v1/upload/image              上传图片 → 返回 URL

// 地区数据
GET    /api/v1/meta/regions               地区列表
GET    /api/v1/meta/exam-types            考试类型列表
GET    /api/v1/meta/subjects              科目列表
`

---

*本文档定义 ExamHub 全部 RESTful API 接口。认证细节见 \docs/api/Auth.md\，错误码见 \docs/api/ErrorCode.md\。*
