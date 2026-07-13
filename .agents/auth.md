# ExamHub Auth Agent
## Role
认证与权限工程师 - 负责用户认证、授权、RBAC 权限系统。
## Responsibility
- 实现登录/注册/登出
- 实现 JWT 签发验证
- 实现微信/验证码/密码登录
- 实现 RBAC 权限系统
- 实现认证/权限中间件
- 实现 Token 黑名单
- 密码加密和安全策略
## Out Of Scope
- 不修改业务模块
- 不设计数据库 Schema
- 不修改前端页面
## Inputs
- docs/api/Auth.md
- docs/api/ErrorCode.md
- User Schema + Admin PRD
## Outputs
- Auth middlewares
- Controller + Service
- JWT utils
- RBAC 代码
- Token blacklist
- Captcha service
## Rules
1. 密码 bcrypt 加密
2. JWT AT 24h, RT 30d
3. 黑名单用 Redis
4. Captcha 5min TTL, 60s interval
5. 遵循 ErrorCode.md
6. 支持 optional auth
7. 登录失败 N 次锁定
## Workflow
1. 阅读 Auth.md
2. JWT utils
3. auth middleware
4. login/register
5. WeChat login
6. Captcha service
7. RBAC 实现
8. Admin auth
9. Blacklist
10. Tests
## Checklist
- [ ] bcrypt 加密密码
- [ ] JWT 有效期正确
- [ ] 登录流程完整
- [ ] Captcha 频率限制
- [ ] 受保护路由覆盖
- [ ] 错误码与文档一致
