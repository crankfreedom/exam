# ExamHub 下载中心（Download Center）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

下载中心负责 PDF 文件的下载控制、权限校验、次数限制、水印注入和下载 Token 管理。下载中心不直接生成 PDF（由 PDF Center 负责），只负责分发和权限控制。

---

## 二、下载流程

\\\
用户点击下载
  → 前端请求获取 DownloadToken
    → 后端校验权限
      → 校验用户身份（JWT）
      → 校验购买关系（订单有效）
      → 校验下载次数（可下载）
      → 校验 VIP 状态（VIP 不计数）
    → 生成一次性 DownloadToken（有效期 5 分钟）
    → 缓存到 Redis（key: download:token:{token}）
    → 返回 Token 和 PDF 元信息
  → 前端带 Token 请求 PDF
    → 后端校验 Token
      → 校验 Token 有效性
      → 校验 Token 未使用
      → 标记 Token 已使用（防重复）
    → 检查 OSS 是否有缓存
      → 有缓存：直接返回 OSS 地址（带签名）
      → 无缓存：触发 PDF 生成 → 上传 OSS → 返回地址
    → 记录下载日志
    → 返回 PDF 下载 URL
  → 浏览器下载 PDF
\\\

---

## 三、下载权限模型

### 3.1 权限矩阵

| 用户类型  | VIP | 已购买 | 可下载 | 计数  | 限制        |
| ----- |:---:|:---:|:---:|:---:| --------- |
| 游客    | ✗   | ✗   | ✗   | —   | —         |
| 注册用户  | ✗   | ✗   | ✗   | —   | —         |
| 已购买用户 | ✗   | ✓   | ✓   | ✓   | 30 天 10 次 |
| VIP   | ✓   | —   | ✓   | ✗   | 无限制       |

### 3.2 下载次数计算规则

| 规则     | 说明                       |
| ------ | ------------------------ |
| 计数周期   | 从订单完成开始计算 30 天滚动窗口       |
| 计数粒度   | 每个商品独立计数                 |
| 计数触发   | 每次成功返回 PDF 下载 URL        |
| 重复下载   | 同一商品每次下载都计数              |
| 失败不计   | Token 校验失败 / PDF 生成失败不计数 |
| VIP 不计 | VIP 用户下载不消耗次数            |
| 重置规则   | 30 天滑动窗口，期满自动重置          |

### 3.3 下载次数状态

| 剩余次数    | 前端表现                 |
| ------- | -------------------- |
| > 3     | 显示"剩余 N 次"           |
| 1-3     | 显示"剩余 N 次"，红色提醒      |
| 0       | 显示"下载次数已用完"，引导升级 VIP |
| 无限（VIP） | 显示"VIP 无限下载"         |

---

## 四、DownloadToken 系统

### 4.1 Token 规范

| 属性   | 值                                      |
| ---- | -------------------------------------- |
| 生成方式 | crypto.randomBytes(32).toString('hex') |
| 有效期  | 5 分钟                                   |
| 使用次数 | 一次性（使用后标记作废）                           |
| 存储   | Redis，带 TTL                            |
| 绑定信息 | userId, productId, orderId, 生成时间       |

### 4.2 Token 数据结构（Redis）

`
Key:   download:token:{tokenValue}
Value: {
  userId: "U000001",
  resourceId: "P000001",
  resourceType: "paper",
  orderId: "O000001",
  createdAt: 1700000000,
  used: false
}
TTL: 300 秒
`

### 4.3 Token 校验流程

1. 从请求参数中获取 token
2. 查询 Redis key 是否存在
3. 检查 used 标记
4. 检查是否在有效期内（Redis TTL 自动处理）
5. 标记 used = true
6. 校验通过

---

## 五、下载日志

### 5.1 日志字段

| 字段           | 说明                     |
| ------------ | ---------------------- |
| id           | 日志编号                   |
| userId       | 用户编号                   |
| orderId      | 订单编号（如有）               |
| resourceId   | 资源编号（Paper/Collection） |
| resourceType | 资源类型                   |
| downloadTime | 下载时间                   |
| ip           | 客户端 IP                 |
| userAgent    | 客户端 UA                 |
| token        | 使用的 Token              |
| status       | 成功 / 失败                |
| failReason   | 失败原因                   |

### 5.2 日志用途

- 下载次数统计和限制
- 用户行为分析
- 异常下载检测
- 数据审计

---

## 六、多设备下载

**规则**：

- 允许在不同设备上下载（Mac / Windows / iPad / 手机）
- 不限制设备数量
- 下载次数跨设备共享（30 天 10 次总次数）
- 下载记录跨设备可查

---

## 七、接口设计

| 接口                    | 方法   | 用途               |
| --------------------- | ---- | ---------------- |
| /api/download/token   | POST | 请求 DownloadToken |
| /api/download/pdf     | GET  | 使用 Token 下载 PDF  |
| /api/download/history | GET  | 获取下载历史           |
| /api/download/remain  | GET  | 查询剩余下载次数         |

### 7.1 获取 DownloadToken

`
POST /api/download/token
Authorization: Bearer {jwt}
Body: { resourceId: "P000001", resourceType: "paper" }

Response: {
  token: "a1b2c3d4...",
  expiresIn: 300,
  fileInfo: {
    fileName: "2024国考行测真题.pdf",
    fileSize: 5242880
  }
}
`

### 7.2 下载 PDF

`
GET /api/download/pdf?token=a1b2c3d4...

Response: PDF 文件流
Headers:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="2024国考行测真题.pdf"
`

---

## 八、安全设计

| 风险       | 防护措施                     |
| -------- | ------------------------ |
| Token 复用 | 一次性 Token，使用后标记作废        |
| Token 泄露 | 有效期 5 分钟，绑定用户            |
| URL 泄露   | OSS 签名 URL，带 IP 和过期时间    |
| 暴力请求     | 限流：每个用户每分钟最多请求 3 次 Token |
| 未授权下载    | JWT 校验 + 购买关系校验          |
| PDF 分享   | 动态水印含用户信息（暗水印可追溯）        |

---

*本文档定义下载中心的架构设计。PDF 生成细节见 \docs/architecture/04-PDF-Center.md\。*
