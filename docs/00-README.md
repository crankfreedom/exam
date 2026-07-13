# ExamHub 考试内容平台 — 项目总览

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13
> **所有 Agent 的入口文档，任何 Agent 接入本项目前必须先阅读本文档。**

---

## 项目简介

**ExamHub**（考试内容平台）是一个以内容为核心（Content First）的考试资料分发与在线学习平台。V1 定位为资料库 + PDF 销售平台，V2 演进为在线刷题平台，V3 最终成为综合在线学习平台（AI 解析、AI 组卷、AI 错题分析等）。

---

## 核心理念

> **Content First** — 不是围绕 PDF，而是围绕题目（Question）设计整个系统。

PDF 只是渲染结果，不是数据源。永远由 Question → Paper → Render → 动态生成。

---

## 文档地图

所有文档集中在 \docs/\ 目录下，按主题分层组织：

| 层级 | 目录 | 说明 |
|------|------|------|
| 基础文档 | /docs | 项目总览、愿景、原理、技术栈、架构 |
| 产品文档 | docs/product/ | 用户端 PRD、管理端 PRD、页面流程、交互设计 |
| 架构文档 | docs/architecture/ | 内容中心、搜索、下载、PDF、导入、采集、版本系统 |
| 数据库 | docs/database/ | ER 图、表结构、索引策略 |
| API | docs/api/ | RESTful 接口、认证、错误码 |
| UI | docs/ui/ | 设计系统、主题（含暗黑模式） |
| 部署 | docs/deployment/ | 部署、OSS、缓存策略 |
| 路线图 | docs/roadmap/ | V1 / V2 / V3 规划 |
| RFC | docs/11-RFC/ | 改进提案 |
| ADR | docs/12-ADR/ | 架构决策记录 |
| Agent 规范 | docs/99-Agent.md | AI 开发规范（所有 Agent 必须遵守） |

---

## 技术概览

| 维度 | 选择 |
|------|------|
| 前端 | Vue3 + Vite + TypeScript |
| 后端 | Node.js + Express |
| 架构 | 模块化单体（Modular Monolith） |
| 数据库 | 关系型数据库，每题独立存储 |
| 文件存储 | 对象存储 OSS |
| 搜索 | 后续接入 Elasticsearch / Meilisearch |

---

## 核心内容模型（五层架构）

\\\
Material（材料）     → 多题共用的材料/阅读材料
   ↓
Question（题目）     → 每道题独立存储，唯一编号 Q000001
   ↓
Paper（试卷）        → N 道题组成一张试卷，唯一编号 P000001
   ↓
Collection（合集）   → 多张试卷组成合集，唯一编号 C000001
   ↓
Product（商品）      → 内容与销售分离，唯一编号 PR000001
   ↓
Order（订单）        → 商品销售，唯一编号 O000001
\\\

**核心原则：** Content（内容）和 Product（商品）完全分离。一个 Collection 可以生成多个商品。

---

## 系统设计原则（最高准则）

1. **Content First** — 围绕 Content 设计，不围绕 PDF 设计
2. **唯一编号** — 所有对象统一编号（Q/P/C/PR/U/O...）
3. **内容与商品分离** — Content ≠ Product
4. **统一导入器** — 所有格式最终转同一 JSON Schema
5. **PDF 只是渲染结果** — 不是数据源
6. **版本管理** — 所有资源支持版本（V1/V2/V3）
7. **页面兼容性** — 所有页面后续可升级为在线刷题
8. **SEO 先行** — URL 一旦确定永不改变

---

## 销售方式

1. 单卷购买（如一套 9.9 元）
2. 套餐购买（如 100 套 99 元）
3. 包年 VIP（如 199 元无限下载）
4. 积分兑换（签到获得积分，兑换资料）

---

## 用户体系

| 角色 | 权限说明 |
|------|---------|
| 游客 | 浏览首页、搜索、分类、查看资料详情、查看前 3~5 题及答案解析 |
| 注册用户 | 游客权限 + 收藏、浏览历史、购买、订单、下载记录、积分 |
| 已购买用户 | 对已购资料永久查看、30 天内 10 次下载，PDF 更新后可永久免费更新 |
| VIP（包年） | 无限下载所有文件、查看全部解析、VIP 专区、后续开放在线刷题/AI 功能 |
| 客服 | 管理端角色 |
| 管理员 | 管理端角色 |
| 超级管理员 | 管理端最高权限 |

---

## 登录方式（V1）

- 微信扫码登录（自动绑定手机号）
- 手机验证码登录
- 手机号+密码登录
- 邮箱+密码登录

---

## Git 目录结构（建议）

\\\
exam-platform/
├── docs/          软件设计文档（20+ 个 md 文件）
├── frontend/      Vue3 + Vite + TS
├── backend/       Express + Node.js
├── packages/      shared 公共模块
├── scripts/
├── docker/
├── sql/
├── mock/
├── assets/
├── tools/
└── README.md
\\\

---

## 关键业务规则汇总

| 规则 | 内容 |
|------|------|
| 下载次数 | 30 天内最多 10 次 |
| 订单有效期 | 永久 |
| 更新策略 | 已购买用户永久免费更新 |
| 水印 | 明水印 + 暗水印，含用户信息 |
| 打印 | 允许 |
| 多设备 | 允许（Mac/Windows/iPad/手机） |
| PDF 生成 | 前端解密 + 客户端生成 |
| DownloadToken | 一次性，5 分钟有效期 |
| 商品状态 | 草稿 → 待发布 → 已发布 → 已下架 → 已删除 |
| 限时活动 | 后台直接设置开始/结束时间，不改代码 |
| 免费资源 | 商品价格可设为 0 元 |
| 商品绑定 | 一个商品可绑定多个资源（Paper/Collection 等） |
| 考试分类 | V1：国考/省考/事业单位/教师/考研/四六级 |
| 编号规则 | 前缀+6 位数字：Q000001, P000001, C000001... |
| 文档版本 | docs 整体有版本号（v1.0.0），修改需升级版本 |
| AI 约束 | 任何 Agent 不得修改 docs/ 中已确认内容 |
| 架构模式 | 模块化单体，不拆分微服务 |

---

## 开发阶段

### 第一阶段：基础文档
00-README.md → 01-Project-Vision.md → 02-System-Principles.md → 03-Tech-Stack.md → 04-Architecture.md

### 第二阶段：产品文档
Frontend PRD → Admin PRD → Page Flow → UI

### 第三阶段：技术文档
Database → API → Permission → Importer → PDF → Download → Search

### 第四阶段：工程文档
Deployment → CI/CD → Roadmap → ADR → RFC → 99-Agent

---

*本文档是 ExamHub 的入口文档，所有 Agent 在开始工作前必须完整阅读。*
