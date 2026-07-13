# ExamHub 项目分析报告

> **文档版本：** v1.0.0
> **生成日期：** 2026-07-13
> **用途：** 为 Multi-Agent Framework 提供项目全局上下文

---

## 一、项目概述

**ExamHub**（考试内容平台）是一个以内容为核心（Content First）的考试资料分发与在线学习平台。V1 定位为资料库 + PDF 销售平台，V2 演进为在线刷题平台，V3 最终成为综合在线学习平台。

核心理念：围绕题目（Question）设计系统，PDF 只是渲染结果而非数据源。

---

## 二、技术栈

### 2.1 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | >= 3.5 | 前端框架（Composition API + Script Setup） |
| Vite | >= 6.3 | 构建工具 |
| TypeScript | ~5.8 | 类型系统（严格模式） |
| Vue Router | >= 4.5 | 路由 |
| Pinia | >= 3.0 | 状态管理 |
| CSS Variables | - | 主题系统（含暗黑模式） |
| LESS | - | 样式预处理 |
| Lucide Icons | - | 图标库 |
| pdf-lib / pdfmake | - | 客户端 PDF 生成 |
| Axios | - | HTTP 请求 |
| MathJax / KaTeX | - | 公式渲染 |

### 2.2 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 22 | 运行时 |
| Express | >= 4.18 | Web 框架 |
| TypeScript | ~5.8 | 类型系统（严格模式） |
| Vite (SSR build) | >= 6.3 | 后端构建工具 |
| vite-node | >= 3.0 | 开发时直接运行 TS |
| nodemon | >= 3.1 | 开发热重载 |
| helmet | >= 8.0 | 安全 HTTP 头 |
| cors | >= 2.8 | 跨域处理 |
| compression | >= 1.7 | Gzip/Brotli 压缩 |
| uuid | >= 14.0 | 唯一标识生成 |
| selenium-webdriver | >= 4.46 | 自动化爬取（Chalk 采集器） |
| Sequelize / TypeORM | - | ORM（规划中） |
| ioredis | - | Redis 客户端（规划中） |
| jsonwebtoken | - | JWT 认证（规划中） |
| bcrypt | - | 密码哈希（规划中） |
| zod / joi | - | 参数校验（规划中） |
| winston / pino | - | 日志（规划中） |
| multer | - | 文件上传（规划中） |
| @aws-sdk/client-s3 | - | OSS 操作（规划中） |
### 2.3 基础设施

| 技术 | 版本 | 用途 |
|------|------|------|
| PostgreSQL | >= 15 | 关系型数据库（或 MySQL >= 8.0） |
| Redis | >= 7.0 | 缓存 / Session / 分布式锁 |
| OSS | - | 对象存储（阿里云 OSS / AWS S3） |
| Nginx | - | 反向代理 / SSL / 静态文件 |
| Docker + Docker Compose | - | 容器化部署 |
| GitHub Actions | - | CI/CD |

### 2.4 开发工具

| 工具 | 用途 |
|------|------|
| ESLint | 代码规范检查（规划中） |
| Prettier | 代码格式化（规划中） |
| Husky + lint-staged | Git hooks（规划中） |
| Jest / Vitest | 单元测试（规划中） |
| Playwright | 端到端测试（规划中） |
| Swagger / OpenAPI | API 文档（规划中） |

---

## 三、目录结构

```text
exam/
├── docs/                          # 软件设计文档（20+ 个 md 文件）
├── server/                        # 后端（Express + TS）
│   ├── src/
│   │   ├── index.ts               # 应用入口
│   │   ├── config/                # 环境变量配置
│   │   ├── routes/                # 路由层
│   │   ├── controller/            # 控制器层
│   │   ├── access/                # 访问层（进程隔离）
│   │   ├── task/                  # 任务层（子进程入口）
│   │   ├── models/                # 模型层
│   │   ├── dict/                  # 字典/常量
│   │   └── utils/                 # 工具层
│   ├── dist/                      # 构建输出
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── nodemon.json
│   └── .npmrc
├── web/                           # 前端（Vue 3 + Vite + TS）
│   ├── src/
│   │   ├── App.vue                # 根组件
│   │   ├── main.ts                # 入口
│   │   └── env.d.ts               # 类型声明
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── .npmrc
├── .agents/                       # Agent 定义目录
├── .claude/                       # Claude Code 配置
├── context/                       # 共享上下文
├── tasks/                         # 任务系统
├── review/                        # Review 系统
├── prompts/                       # Prompt 库
├── workflow/                      # 工作流程
├── AGENTS.md                      # Agent 入口文档
├── .gitignore
└── conversation.md
```

---

## 四、前后端架构

### 4.1 架构模式

**模块化单体（Modular Monolith）**：所有功能部署在同一进程中，按业务逻辑划分为清晰模块，模块间通过定义良好的接口通信。

### 4.2 分层架构

```
表示层（Vue 3 前端）-> API 网关 / Express 中间件链 -> 业务模块层 -> 公共服务层 -> 基础设施层
```

### 4.3 后端分层（实际实现）

| 层级 | 目录 | 职责 |
|------|------|------|
| 路由层 | routes/ | 定义 API 路由，挂载中间件 |
| 控制器层 | controller/ | 接收请求，调用下层，返回响应 |
| 访问层 | access/ | 进程隔离，fork 子进程 |
| 任务层 | task/ | 子进程入口，编排流程 |
| 模型层 | models/ | Selenium WebDriver 封装等 |
| 字典层 | dict/ | 常量定义 |
| 工具层 | utils/ | 通用工具函数 |
| 配置层 | config/ | 环境变量配置 |

### 4.4 核心内容模型

五层架构：`Material -> Question -> Paper -> Collection -> Product -> Order`

- Content（内容）和 Product（商品）完全分离
- 一个 Collection 可生成多个商品
- PDF 永远由 Question -> Paper -> Render 动态生成

---

## 五、数据库

### 5.1 表结构概览

已设计 25+ 张表：内容（6）、商品订单（4）、用户（7）、运营（7）、管理端（6）

### 5.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 表名 | 小写 + 下划线 | users, paper_questions |
| 字段名 | 小写 + 下划线 | created_at, exam_type |
| 主键 | id（自增 BIGINT 或 VARCHAR） | id BIGSERIAL / VARCHAR(16) |
| 外键 | {关联表}_id | user_id, paper_id |

### 5.3 唯一编号系统

| 前缀 | 对象 | 示例 |
|------|------|------|
| Q | Question（题目） | Q000001 |
| P | Paper（试卷） | P000001 |
| C | Collection（合集） | C000001 |
| PR | Product（商品） | PR000001 |
| O | Order（订单） | O000001 |
| U | User（用户） | U000001 |
| M | Material（材料） | M000001 |

编号规则：前缀 + 6 位数字，补齐零，不可复用。

---

## 六、API 设计

### 6.1 通用约定

| 规范 | 规则 |
|------|------|
| 基础路径 | /api/v1 |
| 请求体 | JSON |
| 响应体 | 统一 JSON 包装（HTTP 200 + 业务状态码） |
| 认证 | JWT Bearer Token |
| 分页 | ?page=1&pageSize=20 |

### 6.2 统一响应格式

```json
{"code":"000000","message":"success","data":{...}}
```

### 6.3 错误码体系

格式：`{模块码(2位)}{错误类型码(2位)}{序号(2位)}`

### 6.4 API 模块清单

| 模块 | 路径前缀 |
|------|----------|
| 内容中心 | /api/v1/questions, /papers, /collections, /materials |
| 版本管理 | /api/v1/versions/:resourceType/:id |
| 搜索 | /api/v1/search |
| 商品 | /api/v1/products |
| 订单 | /api/v1/orders |
| 下载 | /api/v1/download |
| PDF | /api/v1/pdf |
| 用户认证 | /api/v1/auth, /api/v1/user |
| 采集 | /chalk/create/examination |
| 管理端 | /api/v1/admin/* |

---

## 七、权限系统

### 7.1 用户端角色

| 角色 | 权限 |
|------|------|
| 游客 | 浏览首页、搜索、详情、试看前 3-5 题 |
| 注册用户 | 游客权限 + 收藏、购买、下载 |
| 已购买用户 | 对已购资料永久查看、30 天内 10 次下载 |
| VIP | 无限下载、VIP 专区 |

### 7.2 管理端角色

| 角色 | 权限范围 |
|------|---------|
| 客服 | 订单管理、用户管理（只读） |
| 管理员 | 内容、商品、订单、用户、资讯、SEO 管理 |
| 超级管理员 | 全部权限 |

### 7.3 认证方案

- JWT（Access Token 24h + Refresh Token 30d）
- 支持微信扫码、手机验证码、密码三种登录方式
- 管理端独立登录页（账号密码）
- Token 黑名单（Redis 存储）

---

## 八、构建流程

当前无统一构建脚本，各自独立：

| 项目 | 开发 | 构建 |
|------|------|------|
| server | npm run dev（nodemon + vite-node） | npm run build（vite build SSR） |
| web | npm run dev（vite） | npm run build（vue-tsc + vite build） |

---

## 九、测试方案（规划中）

- 单元测试：Jest / Vitest
- E2E 测试：Playwright
- 当前项目中无任何测试文件

---

## 十、部署方式

| 环境 | 配置 | 工具 |
|------|------|------|
| 开发 | localhost | Docker Compose |
| 生产 | 4C8G x 2 实例 + PG + Redis + OSS | Docker + Nginx + GitHub Actions |

---

## 十一、CI/CD（规划中）

- GitHub Actions：test -> build -> deploy
- 推送 main 分支触发
- 构建 Docker 镜像并推送仓库
- SSH 到服务器拉取部署

---

## 十二、项目规范

### 12.1 文档约束

- 已确认的 docs 文件不可直接修改（需 RFC + ADR 流程）
- 代码行为变更导致 docs 不准确时，允许同步修改
- 用户明确要求修改设计文档时可直接执行

### 12.2 编码规范

| 规范 | 要求 |
|------|------|
| 遵循现有模式 | 新代码与项目已有风格一致 |
| 不引入重大依赖 | 新增依赖需评审 |
| 注释规范 | 只对不明显逻辑加注释 |
| 类型安全 | TS 严格模式 |
| 测试 | 关键路径需有单元测试 |

### 12.3 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件/文件夹 | kebab-case | question-service.ts |
| 类/接口 | PascalCase | QuestionService |
| 变量/函数 | camelCase | getQuestionById |
| 数据库表 | snake_case | paper_questions |
| API 路径 | kebab-case | /api/v1/question-bank |

### 12.4 模块化单体约束

- 每个模块只能操作自己的 Repository
- 跨模块通过 Service 接口
- 禁止循环依赖
- 通用服务放在 common/ 下

### 12.5 禁止事项

- 将 PDF 作为数据源
- 硬编码 URL
- 不使用唯一编号
- 跨越 V1 范围做 V3 功能
- 直接操作生产数据库

---

## 十三、当前开发状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 设计文档 | 已完成 | 20+ 个 md 文件，覆盖架构、API、DB、UI |
| 后端 - Chalk 采集 | 已实现 | 完整爬取流程（登录->组卷->提取->保存） |
| 后端 - 基础框架 | 已搭建 | Express + TS，路由/中间件/响应封装 |
| 后端 - 业务模块 | 未开始 | User/Content/Product/Order 等均未实现 |
| 前端 | 骨架代码 | 仅 App.vue + main.ts，无业务页面 |
| 数据库 | 已设计 | 25+ 张表的 Schema/ER/Index 已定义 |
| 测试 | 未开始 | 无任何测试文件 |
| CI/CD | 未开始 | 无 workflow 配置 |
| 部署 | 已文档化 | Docker Compose + Nginx 方案已设计 |
| 权限系统 | 已设计 | JWT + RBAC，代码未实现 |

---
