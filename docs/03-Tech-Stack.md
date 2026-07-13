# ExamHub 技术栈

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、技术选型总览

| 层级       | 技术选型                        | 版本要求     | 说明                             |
| -------- | --------------------------- | -------- | ------------------------------ |
| **前端框架** | Vue 3                       | ≥ 3.4    | Composition API + Script Setup |
| **构建工具** | Vite                        | ≥ 5.0    | 快速的开发服务器和构建                    |
| **前端语言** | TypeScript                  | ≥ 5.0    | 严格模式                           |
| **后端框架** | Express                     | ≥ 4.18   | Node.js Web 框架                 |
| **后端语言** | TypeScript                  | ≥ 5.0    | 严格模式                           |
| **运行时**  | Node.js                     | ≥ 18 LTS | 长期支持版本                         |
| **数据库**  | 关系型数据库                      | -        | PostgreSQL ≥ 15 或 MySQL ≥ 8.0  |
| **缓存**   | Redis                       | ≥ 7.0    | 缓存 / Session / 分布式锁            |
| **对象存储** | OSS                         | -        | 阿里云 OSS / AWS S3 / 兼容服务        |
| **搜索**   | Elasticsearch / Meilisearch | -        | V2+ 接入，V1 使用数据库全文索引过渡          |

---

## 二、前端技术栈

### 2.1 核心框架

| 技术         | 用途   | 选型理由                           |
| ---------- | ---- | ------------------------------ |
| Vue 3      | 前端框架 | 组合式 API 灵活，TypeScript 支持好，社区活跃 |
| Vite       | 构建工具 | 极速 HMR，原生 ESM，开箱即用的 TS 支持      |
| TypeScript | 类型系统 | 严格的类型检查，提高代码质量和可维护性            |
| Vue Router | 路由   | 官方路由库，支持懒加载和导航守卫               |
| Pinia      | 状态管理 | 轻量、类型安全、Vue 3 官方推荐             |

### 2.2 UI 与样式

| 技术            | 用途             |
| ------------- | -------------- |
| CSS Variables | 主题系统（含暗黑模式）    |
| LESS          | 样式预处理          |
| 响应式栅格         | 适配手机 / 平板 / PC |
| 无重型 UI 框架     | 自定义组件，保持轻量和灵活  |

### 2.3 PDF 生成

| 库       | 用途                  |
| ------- | ------------------- |
| pdf-lib | 在浏览器端生成/修改 PDF      |
| pdfmake | 可选替代方案，基于文档定义生成 PDF |

### 2.4 其他库

| 技术                        | 用途            |
| ------------------------- | ------------- |
| Axios                     | HTTP 请求       |
| CryptoJS / Web Crypto API | 前端解密（AES-GCM） |
| MathJax / KaTeX           | 公式渲染          |
| Highlight.js              | 代码高亮          |

---

## 三、后端技术栈

### 3.1 核心框架

| 技术                 | 用途     | 选型理由                     |
| ------------------ | ------ | ------------------------ |
| Express            | Web 框架 | Node.js 生态最成熟的框架，社区资源丰富  |
| TypeScript         | 类型系统   | 前后端类型统一，shared 模块可共享类型定义 |
| cors               | 跨域处理   | 标准中间件                    |
| helmet             | 安全头    | 设置安全相关的 HTTP 头           |
| compression        | 压缩     | Gzip/Brotli 响应压缩         |
| express-rate-limit | 限流     | API 请求频率限制               |

### 3.2 数据层

| 技术                        | 用途          |
| ------------------------- | ----------- |
| Sequelize / TypeORM       | ORM（关系型数据库） |
| ioredis                   | Redis 客户端   |
| node-cache / memory-cache | 本地缓存（可选辅助）  |

### 3.3 认证与安全

| 技术           | 用途          |
| ------------ | ----------- |
| jsonwebtoken | JWT 签发与验证   |
| bcrypt       | 密码哈希        |
| node-crypto  | AES-GCM 加解密 |
| uuid         | 生成唯一标识      |

### 3.4 文件与存储

| 技术                 | 用途                |
| ------------------ | ----------------- |
| multer             | 文件上传处理            |
| @aws-sdk/client-s3 | OSS 操作（S3 兼容 API） |
| sharp              | 图片处理（可选）          |

### 3.5 工具库

| 技术                   | 用途   |
| -------------------- | ---- |
| zod / joi            | 参数校验 |
| winston / pino       | 日志   |
| dotenv               | 环境变量 |
| selenium-webdriver | 自动化爬取（Chalk 采集器） |
| node-schedule / cron | 定时任务 |
| nodemailer           | 邮件发送 |
| dayjs                | 时间处理 |

---

## 四、公共模块（Shared）

位于 \packages/shared/\ 目录，前后端共享：

| 模块          | 内容                                                       |
| ----------- | -------------------------------------------------------- |
| types/      | 所有核心类型定义（Question, Paper, Collection, Product, Order...） |
| constants/  | 枚举常量（考试类型、商品状态、订单状态、下载次数限制...）                           |
| utils/      | 通用工具函数                                                   |
| validators/ | 共享校验规则                                                   |
| schema/     | JSON Schema 定义（导入器用）                                     |

---

## 五、开发工具

| 工具                      | 用途           |
| ----------------------- | ------------ |
| ESLint                  | 代码规范检查       |
| Prettier                | 代码格式化        |
| Husky + lint-staged     | Git hooks    |
| Jest / Vitest           | 单元测试         |
| Playwright              | 端到端测试        |
| Swagger / OpenAPI       | API 文档       |
| Docker + Docker Compose | 本地开发环境和部署    |
| nvm / fnm               | Node.js 版本管理 |

---

## 六、为什么不选择

| 技术                 | 不选原因                          |
| ------------------ | ----------------------------- |
| React / Next.js    | Vue 更适合国内团队，SEO 需求可通过其他方式满足   |
| Nuxt.js            | V1 页面数量可控，SSR 非必需，后续可按需引入     |
| 微服务                | V1 团队规模小，模块化单体足够，避免分布式复杂度     |
| NoSQL              | 内容模型关系复杂，关系型数据库更合适            |
| GraphQL            | 增加复杂度，V1 的 RESTful 足够，后续可按需引入 |
| Docker Swarm / K8s | V1 部署规模小，Docker Compose 足够    |

---

## 七、版本兼容性

| 运行时        | 最低版本 | 推荐版本        |
| ---------- | ---- | ----------- |
| Node.js    | 22+  | 24 LTS      |
| npm        | 10.x | 11.x        |
| TypeScript | 5.8  | 5.9+        |
| Vue        | 3.5  | 3.5.x 最新稳定版 |
| Vite       | 7.0  | 8.x         |

---

*本文档定义了 ExamHub 的技术选型标准。所有开发工作应在此技术栈范围内进行，引入新依赖需经过团队评审。*
