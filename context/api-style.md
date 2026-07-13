# ExamHub API 规范

## 基础路径
/api/v1

## 请求格式
- Content-Type: application/json
- 认证：Authorization: Bearer {jwt}
- 分页：?page=1&pageSize=20
- 排序：?sort=created_at&order=desc

## 统一响应格式
成功：{"code":"000000","message":"success","data":{...}}
分页：{"code":"000000","data":{"items":[],"total":N,"page":1,"pageSize":20,"totalPages":N}}
错误：{"code":"40001","message":"提示信息","data":null}

## RESTful 规范
GET /resources - 列表查询
GET /resources/:id - 详情
POST /resources - 新建
PUT /resources/:id - 更新
DELETE /resources/:id - 删除
POST /resources/:id/action - 特殊操作

## 错误码格式
{模块码2位}{类型码2位}{序号2位}
模块码：00-通用 10-内容 20-商品 30-订单 40-认证 41-用户 50-下载 60-PDF 70-搜索 80-导入 90-管理端
类型码：00-通用 01-未登录 02-权限 03-参数 04-资源 05-冲突 06-状态 07-频率 10-业务规则

## API 模块清单
内容：/api/v1/questions, /papers, /collections, /materials
版本：/api/v1/versions/:type/:id
搜索：/api/v1/search
商品：/api/v1/products
订单：/api/v1/orders
下载：/api/v1/download
PDF：/api/v1/pdf
认证：/api/v1/auth
用户：/api/v1/user
管理：/api/v1/admin/*
采集：/chalk/create/examination
