# ExamHub 缓存策略

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、缓存架构

| 层级 | 技术 | 存储内容 | 缓存策略 |
|------|------|---------|---------|
| 浏览器缓存 | Service Worker / HTTP Cache | 静态资源（JS/CSS/字体） | 长期缓存 + 版本化 |
| CDN 缓存 | CDN Edge | 图片、公开文件 | 30 天 TTL |
| 应用缓存 | Redis | 热点数据、Session、Token | 按数据决定 TTL |
| 本地缓存 | memory-cache | 配置信息、元数据 | 启动时加载 + 定时刷新 |
| 数据库缓存 | PostgreSQL 共享缓冲区 | 查询结果 | 数据库自动管理 |
| PDF 缓存 | OSS | 生成的 PDF 文件 | 版本控制 + 按需清除 |

---

## 二、Redis 缓存

### 2.1 缓存数据类型

| 数据类型 | Key 模式 | TTL | 说明 |
|---------|---------|:---:|------|
| 用户 Session | session:{userId} | 24h | JWT Refresh Token |
| DownloadToken | download:token:{token} | 5min | 一次性下载凭证 |
| 验证码 | sms:code:{phone} | 5min | 手机验证码 |
| 限流计数器 | rate:limit:{ip}:{action} | 1min-1h | API 限流 |
| 热点数据 | cache:{type}:{id} | 5min-1h | 商品详情、试卷列表等 |
| 黑名单 Token | token:blacklist:{jti} | 24h | 已吊销 Token |

### 2.2 热点数据缓存

**缓存策略**：

`
读取：先查 Redis → 有则返回 → 无则查 DB → 写入 Redis → 返回
写入：写入 DB → 删除 Redis Key → 下次读取时重建缓存
`

**缓存键规范**：

| 数据 | Key | TTL | 说明 |
|------|-----|:---:|------|
| 商品详情 | cache:product:{id} | 300s | 5 分钟 |
| 试卷详情 | cache:paper:{id} | 300s | 5 分钟 |
| 首页数据 | cache:home | 60s | 1 分钟 |
| 分类筛选选项 | cache:filters:{examType} | 600s | 10 分钟 |
| 热门资料 Top 10 | cache:hot:downloads | 300s | 5 分钟 |
| 最新资讯 | cache:news:latest | 300s | 5 分钟 |
| 系统配置 | cache:config:{key} | 3600s | 1 小时 |

### 2.3 缓存穿透防护

`	ypescript
// 布隆过滤器（可选）
// 查询前先检查 Bloom Filter，不存在则直接返回 null

// 空值缓存
// 查询 DB 无结果时，缓存空值 30 秒，防止热点 Key 穿透
if (!data) {
  await redis.setex(cache:null:, 30, 'null');
  return null;
}
`

---

## 三、浏览器缓存

### 3.1 静态资源缓存

| 资源类型 | 缓存策略 | 说明 |
|---------|---------|------|
| JS/CSS | Cache-Control: public, immutable, max-age=31536000 | 文件名含 hash 长期缓存 |
| 字体 | Cache-Control: public, immutable, max-age=31536000 | 长期缓存 |
| 图片（公开） | Cache-Control: public, max-age=2592000 | 30 天 |
| 图片（私有） | Cache-Control: private, max-age=0 | 不缓存 |
| API 响应 | Cache-Control: no-cache | 动态数据不缓存 |

### 3.2 Service Worker 缓存（PWA 可选）

- 预缓存：核心 JS / CSS / 字体
- 运行时缓存：API 请求（网络优先）
- 离线页面：基本 UI 骨架

---

## 四、缓存失效策略

### 4.1 失效触发

| 触发条件 | 失效范围 | 方式 |
|---------|---------|------|
| 商品信息更新 | 删除该商品缓存 | Redis DEL |
| 试卷内容更新 | 删除试卷缓存 + PDF 缓存 | Redis DEL + OSS DEL |
| 首页内容更新 | 删除首页缓存 | Redis DEL |
| 后台修改配置 | 删除对应配置缓存 | Redis DEL |
| 管理员手动清除 | 指定资源 | 后台操作 |
| 定时过期 | 自动 | Redis TTL |

### 4.2 缓存淘汰

`	ypescript
// 更新商品时清除缓存
async function updateProduct(productId: string, data: any) {
  // 1. 更新数据库
  await productRepository.update(productId, data);
  
  // 2. 清除缓存
  await redis.del(cache:product:);
  await redis.del('cache:home'); // 首页可能包含此商品
  
  // 3. 返回
  return { success: true };
}
`

---

## 五、PDF 缓存

PDF 缓存使用 OSS，详见 OSS 文档。核心规则：

| 规则 | 说明 |
|------|------|
| 缓存键 | oss://examhub/pdf/{resourceId}/v{version}.pdf |
| 内容更新 | 版本号 +1，旧文件不删除（可回滚） |
| 手动清除 | 删除 OSS 文件，下次请求重新生成 |
| 有效期 | 永久（直到版本更新） |

---

## 六、缓存监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|---------|
| Redis 内存使用率 | 当前内存 / 最大内存 | > 80% |
| Redis 命中率 | hits / (hits + misses) | < 70% |
| Redis 连接数 | 当前连接数 | > 最大连接数 80% |
| 缓存穿透率 | null 缓存次数 / 总查询 | > 10% |
| 慢查询 | 数据库查询 > 500ms | 频次监控 |

---

*本文档定义 ExamHub 的缓存策略。部署架构见 \docs/deployment/Deploy.md\，OSS 配置见 \docs/deployment/OSS.md\。*
