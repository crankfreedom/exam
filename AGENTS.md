# ExamHub Multi-Agent 开发框架

> **文档版本：** v1.0.0
> **最后更新：** 2026-07-13
> **所有 Agent 在参与 ExamHub 开发前必须完整阅读本文档及 context/ 下所有文档。**

---

## 项目简介

**ExamHub**（考试内容平台）是一个以内容为核心（Content First）的考试资料分发与在线学习平台。V1 定位为资料库 + PDF 销售平台，V2 演进为在线刷题平台，V3 最终成为综合在线学习平台。

## 项目结构

```
exam/
├── .agents/        # Agent 定义文件（9 个 Agent）
├── .claude/        # Claude Code 配置
├── context/        # 共享上下文（8 个文件）
├── docs/           # 设计文档（20+ 文件）
├── prompts/        # Agent Prompt 库（5 个文件）
├── review/         # Review 系统
├── tasks/          # 任务系统
├── workflow/       # 工作流程定义
├── server/         # 后端（Express + TypeScript）
├── web/            # 前端（Vue 3 + Vite + TS）
├── AGENTS.md       # 本文档 - Agent 入口
└── 00-ExamHub-SUMMARY.md
```

## Agent 框架

### 当前 Agent（9 个）

| Agent | 文件 | 职责 |
|-------|------|------|
| Manager | .agents/manager.md | 任务调度、Agent 协调、质量审核 |
| Architect | .agents/architect.md | 架构设计、模块划分、ADR 记录 |
| Database | .agents/database.md | 数据库 Schema、Migration、Repository |
| Backend | .agents/backend.md | 后端业务模块实现 |
| Frontend | .agents/frontend.md | Vue 3 前端页面和组件 |
| Auth | .agents/auth.md | 认证、授权、RBAC 权限 |
| Test | .agents/test.md | 测试用例编写和执行 |
| Docs | .agents/docs.md | 文档维护和更新 |
| DevOps | .agents/devops.md | 部署、CI/CD、监控 |

### 新增 Agent

未来可在 .agents/ 下创建新文件，无需修改已有架构：
- payment.md / crawler.md / ai.md / search.md / report.md / analytics.md

## Agent 工作原则

1. **Manager 是唯一调度中心** - 不直接编写业务代码
2. **任务驱动** - 所有工作基于 Task，使用 tasks/template.md 模板
3. **明确边界** - 每个 Agent 只在自己的职责范围内工作
4. **依赖有序** - 按依赖顺序调度，不并行执行有依赖的任务
5. **输出可审查** - 每个 Agent 的输出必须可被 Manager Review
6. **文档同步** - 代码变更后必须更新相关文档
7. **渐进增强** - 在 V1 范围内实现，不为 V3 过设计

## 开发规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件/文件夹 | kebab-case | question-service.ts |
| 类/接口 | PascalCase | QuestionService |
| 变量/函数 | camelCase | getQuestionById |
| 数据库表 | snake_case | paper_questions |
| API 路径 | kebab-case | /api/v1/question-bank |
| CSS 变量 | kebab-case | --color-brand |

### 编码规范

| 规范 | 要求 |
|------|------|
| 遵循现有模式 | 新代码与项目已有风格一致 |
| 不引入重大依赖 | 新增依赖需评审 |
| 注释规范 | 只对不明显逻辑加注释 |
| 类型安全 | TypeScript 严格模式 |
| 测试 | 关键路径需有单元测试 |

### 模块化单体约束

| 约束 | 说明 |
|------|------|
| 模块边界 | 每个模块只能操作自己的 Repository |
| 跨模块调用 | 通过 Service 接口，不直接访问其他模块的 DB |
| 循环依赖 | 禁止模块间循环依赖 |
| 公共服务 | 通用服务放在 common/ 下 |

### 设计原则

1. **Content First** - 围绕 Content 设计，不围绕 PDF
2. **唯一编号** - 所有对象统一编号（Q/P/C/PR/U/O/M）
3. **内容与商品分离** - Content != Product
4. **PDF 只是渲染结果** - 不是数据源
5. **版本管理** - 所有资源支持版本
6. **SEO 先行** - URL 一旦确定永不改变

### 禁止事项

| 禁止 | 替代方案 |
|------|---------|
| 将 PDF 作为数据源 | 始终从 Question -> Paper -> Render |
| 硬编码 URL | 使用配置或路由系统 |
| 从 process.env 获取配置 | 配置直接书写在 src/config/ 模块中（参考 config/env.ts） |
| 不使用唯一编号 | 使用统一编号系统 |
| 跨越 V1 范围做 V3 功能 | 在 V1 约定范围内实现 |
| 直接操作生产数据库 | 通过 Migration + Service |

## Task 生命周期

1. **创建** - Manager 分析需求，创建 Task（tasks/template.md）
2. **分派** - Manager 按依赖顺序分派给 Agent
3. **执行** - Agent 读取 Task 和相关文档，完成工作
4. **检查** - Manager 检查 Agent 输出
5. **审核** - Manager 执行最终 Review（review/review-checklist.md）
6. **提交** - Manager 创建 Commit，合并代码
7. **关闭** - Manager 报告完成

## Review 原则

Review 由 Manager 执行，依据 review/review-checklist.md 逐项检查：

1. 代码规范命名是否正确
2. 性能是否存在 N+1 查询
3. 安全是否防护到位
4. SQL 是否规范可回滚
5. API 是否符合规范
6. Vue 组件是否响应式
7. 测试是否覆盖关键路径
8. 日志是否完整
9. 异常处理是否完善
10. 文档是否同步更新

## 必要阅读文档

所有 Agent 在开始工作前必须阅读：

1. 本文档（AGENTS.md）
2. context/ 下所有文件（8 个）
3. 所属 Agent 的 .agents/{name}.md
4. 相关设计文档（docs/ 下对应文件）

## 提交规范

格式：<type>(<scope>): <description>

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 缺陷修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

示例：
feat(chalk): add smart exam paper creation
fix(auth): fix JWT token refresh mechanism
docs(api): update REST API documentation
