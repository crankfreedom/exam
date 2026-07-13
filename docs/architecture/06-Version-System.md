# ExamHub 版本系统（Version System）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

版本系统贯穿 ExamHub 全部内容资源，确保所有变更可追溯、可回滚、可同步。版本管理是内容质量保障的核心机制，也是"已购用户永久免费更新"功能的技术基础。

---

## 二、版本范围

| 资源类型 | 版本标识 | 版本策略 | 触发条件 |
|---------|---------|---------|---------|
| Material | 数字 v1/v2/v3 | 每次修改 +1 | 内容变更 |
| Question | 数字 v1/v2/v3 | 每次修改 +1 | 题干/选项/答案/解析变更 |
| Paper | 数字 v1/v2/v3 | 引用变更 / 结构变更 +1 | 题目增删、顺序调整、分部分变更 |
| Collection | 数字 v1/v2/v3 | 引用变更 +1 | 试卷增删、顺序调整 |
| Product | 数字 v1/v2/v3 | 信息变更 +1 | 价格/描述/绑定资源变更 |
| PDF 缓存 | 数字 v1/v2/v3 | 跟随 Paper/Collection | 内容版本变化时自动失效 |
| 文档 | semver v1.0.0 | 语义化版本 | 文档内容变更 |

---

## 三、版本号管理

### 3.1 语义化版本（文档）

`
v{major}.{minor}.{patch}
`

| 位 | 变化 | 示例 |
|----|------|------|
| major | 重大重构/不兼容变更 | v2.0.0 |
| minor | 新增重要内容 | v1.1.0 |
| patch | 修正/补充 | v1.0.1 |

### 3.2 递增版本（内容）

`
{v1, v2, v3, ...}
`

- 从 v1 开始递增
- 每次内容修改版本号 +1
- 无 major/minor/patch 区分
- 版本号不重置

---

## 四、版本关联与传播

### 4.1 版本依赖关系

\\\
Material v2
  → Question v3（引用 Material 的版本）
    → Paper v2（引用 Question 的版本列表）
      → Collection v1（引用 Paper 的版本列表）
        → Product v2（引用 Collection 的版本）
          → PDF 缓存 v2
\\\

### 4.2 版本传播规则

| 变更类型 | 传播范围 | 说明 |
|---------|---------|------|
| Material 内容修改 | Question +1, Paper +1 | 修改传播到引用的上层 |
| Question 内容修改 | Paper +1 | Paper 存有 Question 版本列表 |
| Question 答案修改 | Paper +1 | 答案变更影响试卷 |
| Paper 结构修改 | Collection +1 | 增删题目或调整顺序 |
| Collection 结构修改 | Product +1 | 增删试卷或调整顺序 |
| Product 信息修改 | 不传播 | 不引发生成变化 |
| PDF 手动重新生成 | — | PDF 本身无版本号，缓存键引用源版本 |

### 4.3 版本快照

当上层资源引用下层资源时，记录被引资源的当前版本号：

`json
{
  "paperId": "P000001",
  "version": 2,
  "questionRefs": [
    { "questionId": "Q000001", "versionAtRef": 3 },
    { "questionId": "Q000002", "versionAtRef": 2 }
  ]
}
`

---

## 五、版本操作

### 5.1 更新流程

\\\
管理员修改 Question 内容
  → 系统自动创建 Question v3
  → 检测到被 Paper v2 引用
  → Paper 版本 +1 → Paper v3
  → 生成 Paper v3 时使用 Question v3
  → PDF 缓存 P000001/v2 失效
  → 下次下载时生成 P000001/v3.pdf
\\\

### 5.2 新建 vs 编辑

| 操作 | 行为 |
|------|------|
| 保存草稿 | 不生成新版本 |
| 从草稿发布 | 生成 v1 |
| 编辑已发布内容并保存 | 生成 v +1 |
| 回滚到上一版本 | 内容恢复 + 版本号 +1（不重复） |

### 5.3 同步更新

当 Question 更新后，管理员可以选择是否同步到引用的 Paper：

| 选项 | 行为 |
|------|------|
| 自动同步 | Paper 版本 +1，使用最新 Question |
| 手动同步 | Paper 继续使用旧版本 Question，管理员手动触发后更新 |
| 不更新 | Paper 保持原版本引用 |

---

## 六、历史记录

### 6.1 版本历史

每个资源都维护版本变更记录：

`json
{
  "resourceId": "Q000001",
  "versions": [
    {
      "version": 1,
      "content": "旧题干",
      "answer": "A",
      "changedBy": "admin",
      "changedAt": "2024-01-01T10:00:00Z",
      "changeLog": "初始创建"
    },
    {
      "version": 2,
      "content": "修改后的题干",
      "answer": "B",
      "changedBy": "admin",
      "changedAt": "2024-01-15T14:00:00Z",
      "changeLog": "修正题干表述，答案从 A 改为 B"
    }
  ]
}
`

### 6.2 变更日志规范

每次版本变更必须填写变更日志（changeLog），格式：

`
{操作类型}：{变更描述}

操作类型：创建 / 修改 / 修复 / 删除 / 回滚 / 同步
示例：
- 创建：初始版本
- 修改：更新题干第 3 行表述
- 修复：修正答案 B→C
- 回滚：回滚至 v2
- 同步：同步上游 Material 变更
`

---

## 七、文档版本管理

| 内容 | 版本策略 |
|------|---------|
| 每个文档 | 文件头标注版本号 |
| docs 目录整体 | 全局版本号（当前 v1.0.0） |
| 修改流程 | 任何 Agent 不得修改 docs/ 中已确认内容 |
| 修改方式 | 需通过 ADR 流程，修改后更新版本号 |

---

## 八、接口设计

| 接口 | 方法 | 用途 |
|------|------|------|
| /api/versions/:resourceType/:id | GET | 获取资源的版本历史 |
| /api/versions/:resourceType/:id/rollback | POST | 回滚到指定版本 |
| /api/versions/:resourceType/:id/:version | GET | 获取特定版本的内容 |
| /api/versions/:resourceType/:id/diff | GET | 对比两个版本的差异（?from=v2&to=v3） |

---

## 九、版本号在 URL 中的使用

| 场景 | 用法 |
|------|------|
| PDF 缓存键 | \/pdf/{resourceId}/v{version}.pdf\ |
| API 响应头 | \X-Resource-Version: 2\ |
| 前端显示 | "版本 v2（2024-01-15 更新）" |
| 下载中心 | 显示各资料的版本信息和更新日期 |

---

*本文档定义版本系统的架构设计。版本系统与 PDF 缓存联动见 \docs/architecture/04-PDF-Center.md\。*
