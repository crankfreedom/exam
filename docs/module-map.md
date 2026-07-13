# ExamHub 模块映射

> 文档版本：v1.0.0
> 最后更新：2026-07-13

---

## 一、模块总览

### 1.1 后端模块

| 模块名称 | 路径 | 负责人 Agent | 依赖 | 状态 |
|---------|------|-------------|------|------|
| 应用入口 | server/src/index.ts | Backend | - | 已实现 |
| 配置管理 | server/src/config/ | Backend | - | 已实现 |
| 路由中间件 | server/src/routes/index.ts | Backend | - | 已实现 |
| 404 处理 | server/src/routes/notFound.ts | Backend | - | 已实现 |
| Chalk 路由 | server/src/routes/chalk.ts | Backend | - | 已实现 |
| Chalk 控制器 | server/src/controller/chalk.ts | Backend | Chalk Access | 已实现 |
| Chalk 访问层 | server/src/access/chalk.ts | Backend | Chalk Task | 已实现 |
| Chalk 任务 | server/src/task/chalkCreateExamPaper.ts | Backend | Chalk Model | 已实现 |
| Chalk 模型 | server/src/models/Chalk.ts | Backend | selenium-webdriver | 已实现 |
| 响应封装 | server/src/models/response.ts | Backend | - | 已实现 |
| 字典常量 | server/src/dict/code.ts | Backend | - | 已实现 |
| 文件保存 | server/src/utils/save.ts | Backend | uuid | 已实现 |
| 工具函数 | server/src/utils/normalized.ts | Backend | OS | 已实现 |
| 用户模块 | 规划中：modules/user/ | Backend, Auth | Database | 未开始 |
| 内容模块 | 规划中：modules/content/ | Backend | Database | 未开始 |
| 商品模块 | 规划中：modules/product/ | Backend | Database | 未开始 |
| 订单模块 | 规划中：modules/order/ | Backend | Database | 未开始 |
| 搜索模块 | 规划中：modules/search/ | Backend | Database | 未开始 |
| 下载模块 | 规划中：modules/download/ | Backend | Database | 未开始 |
| 导入模块 | 规划中：modules/importer/ | Backend | Database | 未开始 |
| 管理模块 | 规划中：modules/admin/ | Backend, Auth | 各业务模块 | 未开始 |

### 1.2 前端模块

| 模块名称 | 路径 | 负责人 Agent | 依赖 | 状态 |
|---------|------|-------------|------|------|
| 应用入口 | web/src/App.vue | Frontend | - | 已实现 |
| 入口文件 | web/src/main.ts | Frontend | Vue/Pinia/Router | 已实现 |
| 类型声明 | web/src/env.d.ts | Frontend | - | 已实现 |
| 首页 | 规划中：pages/home/ | Frontend | 公共组件 | 未开始 |
| 分类页 | 规划中：pages/category/ | Frontend | 公共组件 | 未开始 |
| 搜索页 | 规划中：pages/search/ | Frontend | 公共组件 | 未开始 |
| 商品详情 | 规划中：pages/product-detail/ | Frontend | 公共组件 | 未开始 |
| 在线阅读 | 规划中：pages/reader/ | Frontend | PDF 组件 | 未开始 |
| 支付页 | 规划中：pages/payment/ | Frontend | 订单 API | 未开始 |
| 个人中心 | 规划中：pages/user-center/ | Frontend | 用户 API | 未开始 |
| VIP 中心 | 规划中：pages/vip-center/ | Frontend | VIP API | 未开始 |
| 订单中心 | 规划中：pages/order-center/ | Frontend | 订单 API | 未开始 |
| 下载中心 | 规划中：pages/download-center/ | Frontend | 下载 API | 未开始 |
| 收藏 | 规划中：pages/favorite/ | Frontend | 用户 API | 未开始 |
| 资讯 | 规划中：pages/news/ | Frontend | 内容 API | 未开始 |
| 导航 | 规划中：pages/official-links/ | Frontend | 内容 API | 未开始 |
| 管理端模块 | 规划中：admin/ | Frontend | 各管理 API | 未开始 |

### 1.3 公共组件（规划中）

| 组件 | 负责人 | 依赖 | 用途 |
|------|--------|------|------|
| Button | Frontend | Design System | UI 基础组件 |
| Input | Frontend | Design System | 表单输入 |
| Card | Frontend | Design System | 内容卡片 |
| Modal | Frontend | Design System | 弹窗 |
| Toast | Frontend | Design System | 轻提示 |
| Pagination | Frontend | Design System | 分页 |
| QuestionCard | Frontend | - | 题目展示（阅读/刷题双模式） |
| QuestionForm | Frontend | - | 题目编辑表单 |
| PDFViewer | Frontend | pdf-lib/pdfmake | PDF 预览/生成 |
| Watermark | Frontend | - | 水印组件 |
| Skeleton | Frontend | Design System | 骨架屏 |

### 1.4 工具库（规划中）

| 工具 | 负责人 | 依赖 | 用途 |
|------|--------|------|------|
| API Client | Frontend | Axios | HTTP 请求封装 |
| JWT Utils | Auth, Frontend | - | Token 管理 |
| Router Guards | Frontend | Vue Router | 路由守卫 |
| Permission Check | Auth, Frontend | RBAC | 权限检查 |
| SEO Utils | Docs, Frontend | - | SEO 元数据 |
| Validators | Backend | zod/joi | 参数校验 |

### 1.5 数据库模块（已设计，未实现）

| 表组 | 表数量 | 负责人 Agent | 状态 |
|------|--------|-------------|------|
| 内容相关表 | 6 | Database | 已设计 |
| 商品订单表 | 4 | Database | 已设计 |
| 用户相关表 | 7 | Database | 已设计 |
| 运营内容表 | 7 | Database | 已设计 |
| 管理端表 | 6 | Database | 已设计 |

### 1.6 配置与脚本

| 类型 | 文件 | 负责人 | 状态 |
|------|------|--------|------|
| 后端配置 | server/package.json, tsconfig.json, vite.config.ts | Backend | 已实现 |
| 前端配置 | web/package.json, tsconfig.json, vite.config.ts | Frontend | 已实现 |
| 项目配置 | .gitignore, .npmrc | Backend | 已实现 |
| Node 配置 | server/nodemon.json | Backend | 已实现 |

### 1.7 部署相关（已文档化）

| 组件 | 负责人 | 状态 |
|------|--------|------|
| Dockerfile | DevOps | 已设计，代码未写 |
| Docker Compose | DevOps | 已设计 |
| Nginx 配置 | DevOps | 已设计 |
| CI/CD | DevOps | 已设计 |
| 监控 (Sentry/Prometheus) | DevOps | 已设计 |
| 备份策略 | DevOps | 已设计 |

### 1.8 测试（未开始）

| 类型 | 负责人 | 状态 |
|------|--------|------|
| 后端单元测试 | Test, Backend | 未开始 |
| 前端单元测试 | Test, Frontend | 未开始 |
| 集成测试 | Test | 未开始 |
| E2E 测试 | Test | 未开始 |

### 1.9 文档

| 类型 | 数量 | 负责人 | 状态 |
|------|------|--------|------|
| 设计文档 | 20+ | Docs | 已完成 |
| API 文档 | 3 | Docs | 已完成 |
| 架构文档 | 7 | Docs, Architect | 已完成 |
| 数据库文档 | 3 | Docs, Database | 已完成 |
| 产品文档 | 4 | Docs | 已完成 |
| 部署文档 | 3 | Docs, DevOps | 已完成 |
| 路线图 | 3 | Docs | 已完成 |
| RFC/ADR | 2 | Docs, Architect | 已有 ADR-0001, ADR-0002 |

---

## 二、依赖关系图

```
web/ (Frontend)
  -> server/src/ (Backend API)
  -> docs/api/ (API 契约)

server/src/
  -> server/src/routes/ (路由)
  -> server/src/controller/ (控制器)
  -> server/src/access/ (进程隔离)
  -> server/src/task/ (任务)
  -> server/src/models/ (模型)
  -> server/src/utils/ (工具)
  -> server/src/config/ (配置)

docs/design/ (设计文档)
  -> docs/architecture/ (架构)
  -> docs/database/ (数据库)
  -> docs/api/ (API)
  -> docs/product/ (产品)
  -> docs/deployment/ (部署)
  -> docs/ui/ (UI)
  -> docs/roadmap/ (路线图)
```

---

## 三、扩展说明

新增模块时，只需：

1. 在 server/src/modules/ 下创建新模块目录（如果后端）
2. 或在 web/src/pages/ 下创建新页面目录（如果前端）
3. 在 .agents/ 下创建对应的 Agent 定义文件（如果新 Agent）
4. 更新本 module-map.md
5. 无需修改既有架构

新增 Agent 支持：

1. 在 .agents/ 下创建 {name}.md（Role/Responsibility/OutOfScope/Inputs/Outputs/Rules/Workflow/Checklist）
2. 在 prompts/ 下创建 {name}.prompt.md
3. 更新 AGENTS.md 添加新 Agent 简介
4. 不需要修改其他 Agent 或已有架构
