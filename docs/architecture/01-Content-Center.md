# ExamHub 内容中心（Content Center）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

内容中心是 ExamHub 最核心的子系统，负责管理从 Material 到 Collection 的全部内容生命周期。内容中心不感知商品和订单，也即 Content 与 Product 完全解耦。

---

## 二、内容模型体系

### 2.1 五层架构

\\\
Material（材料）     → 多题共用的材料/阅读材料
   ↓
Question（题目）     → 每道题独立存储，唯一编号 Q000001
   ↓
Paper（试卷）        → N 道题组成一张试卷，唯一编号 P000001
   ↓
Collection（合集）   → 多张试卷组成合集，唯一编号 C000001
\\\

### 2.2 Material（材料）

**定义**：多道题目共享的阅读材料（如申论给定资料、英语阅读理解文章、言语理解的段落）。

**字段**：

| 字段        | 类型        | 说明                         |
| --------- | --------- | -------------------------- |
| id        | string    | 材料编号，M000001               |
| title     | string    | 材料标题                       |
| content   | rich text | 材料正文（支持图片、表格、公式）           |
| type      | enum      | 阅读材料 / 听力材料 / 图文材料         |
| questions | number[]  | 关联题目编号列表                   |
| tags      | string[]  | 标签                         |
| version   | number    | 版本号                        |
| status    | enum      | 0-草稿 /1- 已发布/2-已下架 /3- 已废弃 |
| createdAt | datetime  | —                          |
| updatedAt | datetime  | —                          |

**业务规则**：

- 一个 Material 可关联 N 个 Question
- Material 不直接关联 Paper，通过 Question 间接关联
- Material 更新时版本号 +1，所有关联的 Paper 版本也 +1

### 2.3 Question（题目）

**定义**：内容中心的最小原子单元，每道题独立存储、独立编号。

**字段**：

| 字段              | 类型        | 说明                                         |
| --------------- | --------- | ------------------------------------------ |
| id              | string    | 题目编号，Q000001                               |
| type            | enum      | 单选题 / 多选题 / 判断题 / 填空题 / 主观题                |
| content         | rich text | 题干（支持文字、图片、公式）                             |
| options         | JSON      | 选项，格式：{A: \"...\", B: \"...\", C: \"...\"} |
| answer          | JSON      | 正确答案，格式因题型而异                               |
| analysis        | rich text | 解析（支持文字、图片、公式）                             |
| materialId      | string    | 关联的材料编号（可选）                                |
| knowledgePoints | string[]  | 知识点列表                                      |
| difficulty      | enum      | 基础 / 中等 / 困难                               |
| source          | enum      | 历年真题 / 模拟题 / 原创题                           |
| year            | number    | 题目所属年份                                     |
| region          | string    | 题目所属地区                                     |
| examType        | enum      | 国考 / 省考 / 事业单位 / 教师 / 考研 / 四六级             |
| subject         | string    | 科目                                         |
| tags            | string[]  | 自定义标签                                      |
| status          | enum      | 草稿 / 已发布 / 已废弃                             |
| version         | number    | 版本号                                        |
| createdAt       | datetime  | —                                          |
| updatedAt       | datetime  | —                                          |

**题型 answer 格式规范**：

| 题型  | answer 格式 | 示例                   |
| --- | --------- | -------------------- |
| 单选题 | string    | \"A\"                |
| 多选题 | string[]  | [\"A\", \"C\"]       |
| 判断题 | boolean   | true                 |
| 填空题 | string[]  | [\"社会主义\", \"市场经济\"] |
| 主观题 | string    | \"参考要点：…\"           |

**业务规则**：

- 每个 Question 有唯一的 Q 编号
- 题目删除为逻辑删除（标记已废弃）
- 题目修改后版本号 +1
- 题目可单独发布，不依赖 Paper

### 2.4 Paper（试卷）

**定义**：N 道题目按顺序组成一张试卷。

**字段**：

| 字段             | 类型       | 说明             |
| -------------- | -------- | -------------- |
| id             | string   | 试卷编号，P000001   |
| title          | string   | 试卷标题           |
| description    | text     | 试卷描述           |
| examType       | enum     | 考试类型           |
| year           | number   | 年份             |
| region         | string   | 地区             |
| subject        | string   | 科目             |
| difficulty     | enum     | 基础 / 中等 / 困难   |
| totalQuestions | number   | 总题数（自动统计）      |
| totalScore     | number   | 总分（可选）         |
| duration       | number   | 建议用时（分钟）       |
| sections       | JSON     | 分部分结构          |
| tags           | string[] | —              |
| coverImage     | url      | 试卷封面           |
| status         | enum     | 草稿 / 已发布 / 已废弃 |
| version        | number   | 版本号            |
| createdAt      | datetime | —              |
| updatedAt      | datetime | —              |

**Sections（分部分）结构**：

\\\json
{
  \"sections\": [
    {
      \"title\": \"第一部分 言语理解\",
      \"questionCount\": 25,
      \"score\": 25,
      \"startIndex\": 0,
      \"questionIds\": [\"Q000001\", \"Q000002\", ...]
    },
    {
      \"title\": \"第二部分 数量关系\",
      \"questionCount\": 15,
      \"score\": 15,
      \"startIndex\": 25,
      \"questionIds\": [...]
    }
  ]
}
\\\

**业务规则**：

- 试卷至少包含 1 道题
- 题目在试卷中有固定的排序（不因题目自身修改而变化）
- 试卷发布后锁定题目顺序（需创建新版本修改）
- 试卷引用题目时记录当时的题目版本快照

### 2.5 Collection（合集）

**定义**：多张试卷组成的合集。

**字段**：

| 字段             | 类型       | 说明             |
| -------------- | -------- | -------------- |
| id             | string   | 合集编号，C000001   |
| title          | string   | 合集标题           |
| description    | text     | 合集描述           |
| examType       | enum     | 考试类型           |
| year           | number   | 年份             |
| coverImage     | url      | 封面图            |
| paperCount     | number   | 试卷数量（自动统计）     |
| totalQuestions | number   | 总题数（自动统计）      |
| tags           | string[] | —              |
| status         | enum     | 草稿 / 已发布 / 已废弃 |
| version        | number   | 版本号            |
| createdAt      | datetime | —              |
| updatedAt      | datetime | —              |

**业务规则**：

- 合集至少包含 1 张试卷
- 合集内的试卷有排序
- 合集不直接引题目，通过试卷间接引用
- 合集引用试卷时记录当时的试卷版本

---

## 三、核心接口

### 3.1 Question 相关

| 接口                    | 方法     | 用途              |
| --------------------- | ------ | --------------- |
| /api/questions        | GET    | 列表查询（支持多维度筛选）   |
| /api/questions/:id    | GET    | 获取单题详情          |
| /api/questions        | POST   | 新建题目            |
| /api/questions/:id    | PUT    | 更新题目            |
| /api/questions/:id    | DELETE | 逻辑删除            |
| /api/questions/batch  | POST   | 批量创建            |
| /api/questions/import | POST   | 导入（调用 Importer） |

### 3.2 Paper 相关

| 接口                                | 方法   | 用途          |
| --------------------------------- | ---- | ----------- |
| /api/papers                       | GET  | 列表查询        |
| /api/papers/:id                   | GET  | 试卷详情（含题目列表） |
| /api/papers                       | POST | 新建试卷        |
| /api/papers/:id                   | PUT  | 更新试卷        |
| /api/papers/:id/sections          | PUT  | 更新分部分结构     |
| /api/papers/:id/questions         | POST | 添加题目        |
| /api/papers/:id/questions/reorder | PUT  | 重排题目顺序      |
| /api/papers/:id/export            | GET  | 导出试卷 JSON   |

### 3.3 Collection 相关

| 接口                                  | 方法   | 用途          |
| ----------------------------------- | ---- | ----------- |
| /api/collections                    | GET  | 列表查询        |
| /api/collections/:id                | GET  | 合集详情（含试卷列表） |
| /api/collections                    | POST | 新建合集        |
| /api/collections/:id                | PUT  | 更新合集        |
| /api/collections/:id/papers         | POST | 添加试卷        |
| /api/collections/:id/papers/reorder | PUT  | 重排试卷顺序      |

### 3.4 Material 相关

| 接口                 | 方法   | 用途   |
| ------------------ | ---- | ---- |
| /api/materials     | GET  | 列表查询 |
| /api/materials/:id | GET  | 材料详情 |
| /api/materials     | POST | 新建材料 |
| /api/materials/:id | PUT  | 更新材料 |

---

## 四、关键设计

### 4.1 版本快照机制

当 Paper 引用 Question 时，记录当时的 Question 版本号。后续 Question 更新不影响已发布的 Paper 内容，除非管理员手动触发"同步更新"。

### 4.2 统计字段自动计算

- Paper.totalQuestions：由 sections 中的题数汇总
- Collection.paperCount / totalQuestions：由关联的 Paper 汇总
- 每次修改时重新计算，保证一致性

### 4.3 考试类型约束

Question / Paper / Collection 的 examType 必须一致。跨考试类型的组合需要在业务层做校验。

---

*本文档定义内容中心的架构设计，详细的数据库设计见 \docs/database/\ 目录，API 规范见 \docs/api/REST.md\。*
