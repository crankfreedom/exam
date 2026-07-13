# ExamHub 系统架构

## 架构模式
模块化单体（Modular Monolith）- 所有功能部署在同一进程中，按业务逻辑划分为模块。

## 分层结构
表示层 (Vue 3) -> API 网关 (Express) -> 业务模块层 -> 公共服务层 -> 基础设施层

## 业务模块
User / Content (Question/Paper/Collection/Material) / Product / Order / Search / Download / Importer / Chalk / Admin

## 公共服务
ID Generator / Crypto (AES-GCM) / Cache (Redis) / EventBus / JWT Auth

## 核心原则
- Content First：围绕题目设计，PDF 只是渲染结果
- 唯一编号：Q/P/C/PR/U/O/M + 6 位数字
- 内容与商品分离：Content != Product
- SEO 先行：URL 一旦确定永不改变
- 版本管理：所有资源支持版本

## 模块约束
- 每模块只操作自己的 Repository
- 跨模块通过 Service 接口
- 禁止循环依赖
- 通用服务在 common/ 下
- 事件总线用于异步通知

## 部署架构
Nginx -> Node.js x2 -> PostgreSQL + Redis + OSS, Docker Compose 部署

## 核心数据流
Visitor -> Browse -> Pay (WeChat) -> Auto Register -> JWT -> Download PDF
Question -> Paper JSON -> AES-GCM Encrypt -> Browser Decrypt -> Render -> PDF
Upload File -> Parse -> Preview -> Confirm -> Write DB
