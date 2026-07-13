# ExamHub 认证系统（Auth）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

认证系统负责 ExamHub 的用户登录、身份验证、权限控制。支持多种登录方式，采用 JWT（JSON Web Token）作为无状态认证方案。

---

## 二、支持的登录方式（V1）

| 登录方式 | 适用端 | 说明 |
|---------|--------|------|
| 微信扫码登录 | 用户端（Web） | 主要方式，支持自动注册 |
| 手机验证码登录 | 用户端（Web） | 备用方式 |
| 手机号+密码登录 | 用户端（Web） | 备用方式 |
| 邮箱+密码登录 | 用户端（Web） | 备用方式 |
| 账号密码登录 | 管理端 | 管理员专用 |

---

## 三、JWT 规范

### 3.1 Token 结构

`json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "U000001",           // 用户编号
  "role": "user",            // 角色：user / admin / super_admin
  "iat": 1700000000,          // 签发时间
  "exp": 1700086400,          // 过期时间
  "jti": "uuid-v4"            // Token ID（用于吊销）
}
`

### 3.2 Token 有效期

| Token 类型 | 有效期 | 说明 |
|-----------|--------|------|
| Access Token | 24 小时 | 携带在请求头中 |
| Refresh Token | 30 天 | 用于刷新 Access Token |

### 3.3 刷新机制

`
Access Token 过期 → 携带 Refresh Token 请求刷新
  → 验证 Refresh Token 有效性
  → 生成新的 Access Token + Refresh Token
  → 返回给前端
`

**刷新接口**：POST /api/v1/auth/refresh

`json
// Request
{ "refreshToken": "..." }

// Response
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 86400
}
`

---

## 四、微信扫码登录流程

### 4.1 首次使用（游客支付即注册）

\\\
游客点击"微信登录"或"购买"
  → 后端生成微信支付二维码（含 scene 参数：商品 ID + state）
  → 用户扫码 → 微信授权
  → 微信回调 → 返回 code
  → 后端用 code 换取 openid
  → 检查 openid 是否已注册
    → 未注册：自动创建用户账号（nickname=微信昵称, avatar=微信头像）
    → 已注册：获取已有用户信息
  → 生成 JWT（Access Token + Refresh Token）
  → 返回 Token + 用户信息给前端
  → 前端保存 Token → 自动登录
\\\

### 4.2 已注册用户登录

`
用户扫码 → 微信回调 → code → 后端用 code 换 openid
  → 查询用户（openid）
  → 生成 JWT
  → 返回 Token
`

### 4.3 绑定手机号

微信首次注册后，引导用户绑定手机号：

`
POST /api/v1/user/phone
Authorization: Bearer {jwt}
Body: { "phone": "13800138000", "code": "123456" }
`

---

## 五、手机号验证码登录

### 5.1 流程

\\\
用户输入手机号 → 点击"发送验证码"
  → POST /api/v1/auth/send-code
  → 后端生成 6 位验证码
  → 存入 Redis（key: sms:code:{phone}, TTL: 5 分钟）
  → 调用短信服务发送验证码

用户输入验证码 → 点击"登录"
  → POST /api/v1/auth/login/phone
  → Body: { "phone": "...", "code": "..." }
  → 后端验证验证码
  → 验证通过 → 查询用户（手机号）
    → 未注册：自动创建
    → 已注册：生成 JWT
  → 返回 Token
\\\

### 5.2 发送频率限制

| 限制 | 规则 |
|------|------|
| 单手机号 | 60 秒内只能发送 1 次 |
| 单手机号 | 24 小时内最多 10 次 |
| 单 IP | 每小时最多 20 次 |
| 验证码有效期 | 5 分钟 |

---

## 六、密码登录

### 6.1 注册

`
POST /api/v1/auth/register
Body: { "phone": "...", "password": "...", "code": "..." }
`

**密码要求**：
- 长度 8-32 位
- 至少包含字母和数字
- bcrypt 加密存储

### 6.2 登录

`
POST /api/v1/auth/login
Body: { "account": "13800138000", "password": "..." }
`

account 支持：手机号 / 邮箱

### 6.3 密码修改

`
POST /api/v1/user/password
Authorization: Bearer {jwt}
Body: { "oldPassword": "...", "newPassword": "..." }
`

---

## 七、管理端认证

### 7.1 登录

`
POST /api/v1/admin/login
Body: { "username": "admin", "password": "..." }

Response: {
  "accessToken": "...",
  "refreshToken": "...",
  "adminUser": { "id": 1, "username": "admin", "nickname": "管理员" },
  "permissions": ["question:create", "order:view", ...]
}
`

### 7.2 权限校验

管理端 JWT Payload 不携带权限信息，权限在登录时获取，前端通过路由守卫控制菜单位。后端通过中间件校验具体操作权限。

---

## 八、中间件设计

### 8.1 认证中间件

`	ypescript
// 通用认证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ code: 40101, message: '未登录' });
  
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.sub;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 40102, message: 'Token 已过期' });
    }
    return res.status(401).json({ code: 40103, message: 'Token 无效' });
  }
};

// 可选认证中间件（游客可访问，但有用户信息时带上）
const optionalAuthenticate = (req, res, next) => {
  // ... 类似但不返回 401
};
`

### 8.2 权限中间件

`	ypescript
// 管理端权限中间件
const requirePermission = (permissionCode: string) => {
  return async (req, res, next) => {
    // 查询用户权限
    const permissions = await getAdminPermissions(req.adminUserId);
    if (!permissions.includes(permissionCode)) {
      return res.status(403).json({ code: 40301, message: '权限不足' });
    }
    next();
  };
};

// 使用
router.post('/admin/orders/:id/refund', 
  authenticate, 
  requirePermission('order:refund'), 
  orderController.refund
);
`

---

## 九、Token 黑名单

### 9.1 使用场景

| 场景 | 行为 |
|------|------|
| 用户登出 | 将当前 Token 加入黑名单 |
| 修改密码 | 将该用户所有 Token 加入黑名单 |
| 账号被封禁 | 将该用户所有 Token 加入黑名单 |
| Token 泄露 | 手动加入黑名单 |

### 9.2 实现方案

`	ypescript
// Redis 存储黑名单
// Key: token:blacklist:{jti}
// Value: true
// TTL: 剩余 Token 有效期
await redis.set(	oken:blacklist:, 'true', 'EX', remainingTtl);
`

---

## 十、安全设计

| 威胁 | 防护措施 |
|------|---------|
| Token 泄露 | 短有效期（24h）+ Refresh Token 轮换 |
| CSRF | SameSite Cookie / 自定义 Header |
| XSS | 输入过滤 + Content-Security-Policy |
| 暴力破解 | 登录失败 N 次后暂时锁定 |
| 密码泄露 | bcrypt 加盐存储 |
| 重放攻击 | 使用 jti（Token ID）防重复使用 |
| Session 劫持 | 绑定 IP（可选配置） |

---

*本文档定义 ExamHub 的认证系统设计。API 接口清单见 \docs/api/REST.md\，错误码见 \docs/api/ErrorCode.md\。*
