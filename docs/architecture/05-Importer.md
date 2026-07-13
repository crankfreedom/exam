# ExamHub 导入器（Importer）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

Importer 是 ExamHub 的通用内容导入子系统。命名用 Importer 而非"上传"，强调它的功能不仅仅是文件传输，而是格式解析、数据校验、预览确认、批量写入的完整流程。

---

## 二、设计原则

1. **统一 Schema** — 所有导入格式最终转换为同一套 JSON Schema
2. **预览优先** — 必须先预览再确认，不允许直接写入
3. **零 AI 依赖** — V1 不使用 AI 识别，全部由管理员操作
4. **完整报告** — 每次导入生成解析报告

---

## 三、支持的导入格式

| 格式 | 文件扩展名 | V1 支持 | 说明 |
|------|-----------|:-------:|------|
| JSON | .json | ✓ | 原生格式，精确映射 |
| Markdown | .md | ✓ | 通过解析器转 JSON |
| Word | .docx | ✓ | 通过解析器转 JSON |

---

## 四、统一 JSON Schema

所有格式的导入文件最终都会转换为以下 JSON 结构：

`json
{
  "version": "1.0",
  "meta": {
    "title": "2024 国考行测真题",
    "examType": "国考",
    "year": 2024,
    "region": "全国",
    "subject": "行测",
    "description": "2024 年国家公务员考试行政职业能力测验真题",
    "duration": 120,
    "totalScore": 100
  },
  "sections": [
    {
      "title": "第一部分 言语理解",
      "questions": [
        {
          "type": "单选题",
          "content": "以下哪项最符合文意？",
          "contentImage": null,
          "options": {
            "A": "...",
            "B": "...",
            "C": "...",
            "D": "..."
          },
          "optionsImage": null,
          "answer": "A",
          "analysis": "根据文章第 X 段…",
          "material": null,
          "difficulty": "中等",
          "knowledgePoints": ["言语理解", "主旨概括"],
          "source": "历年真题",
          "year": 2024
        }
      ]
    }
  ],
  "materials": [
    {
      "id": 1,
      "title": "材料一",
      "content": "阅读材料全文…"
    }
  ]
}
`

---

## 五、导入流程

### 5.1 完整流程

\\\
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 选择文件  │ → │ 上传     │ → │ 解析预览  │ → │ 检查修改  │ → │ 确认导入  │
│ (选格式)  │   │ (拖拽)   │   │ (树形)   │   │ (逐题)   │   │ (批量)   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                                  │
                                                                  ▼
                                                            ┌──────────┐
                                                            │ 生成报告  │
                                                            └──────────┘
\\\

### 5.2 步骤详解

#### 步骤 1：选择格式 + 上传文件

- 支持拖拽上传和点击选择
- 显示文件选择区域，标明支持的格式
- 上传时显示进度条
- 文件大小限制：JSON/MD 10MB，DOCX 20MB

#### 步骤 2：解析

- 根据文件后缀选择对应的解析器
- 解析器将文件内容转换为统一 JSON Schema
- 验证数据结构完整性
- 检查必填字段
- 发现错误时标记具体位置

#### 步骤 3：预览

- 树形结构展示解析结果
- 左侧：试卷结构树（部分 → 题号 → 题目摘要）
- 右侧：选中题目的完整内容渲染
- 错误高亮（红色标记问题字段）
- 统计面板：成功题数 / 失败题数 / 图片数 / 公式数 / 材料组数

#### 步骤 4：检查 + 修改

- 管理员可逐题检查和修改
- 支持直接编辑 JSON
- 支持删除错误题目
- 支持添加新题目（表单模式）
- 修改后重新校验

#### 步骤 5：确认导入

- 批量写入数据库
- 自动生成编号（Q000001... / P000001...）
- 如果导入内容构成完整试卷，同时生成 Paper

#### 步骤 6：生成报告

`json
{
  "importId": "IMP000001",
  "status": "completed",
  "totalQuestions": 135,
  "successCount": 133,
  "failCount": 2,
  "errors": [
    {
      "index": 47,
      "content": "第 48 题缺少答案",
      "level": "error"
    }
  ],
  "materialsCount": 4,
  "imageCount": 12,
  "formulaCount": 3,
  "duration": 2340,
  "createdAt": "2024-01-01T12:00:00Z"
}
`

---

## 六、解析器设计

### 6.1 JSON 解析器

- 直接解析 JSON 文件
- 校验 JSON Schema 结构
- 类型检查（字符串/数字/数组/对象）

### 6.2 Markdown 解析器

**MD 格式约定**：

`markdown
# 试卷标题
> 考试类型：国考
> 年份：2024

## 第一部分 言语理解

### 第 1 题
题干内容...

A. 选项 A
B. 选项 B
C. 选项 C
D. 选项 D

**答案**：A

**解析**：此处填写解析内容…

---
`

**解析规则**：
- # H1 → 试卷标题
- > key: value → 元信息
- ## H2 → 部分标题
- ### 第 N 题 → 题目标记
- A. / B. / C. / D. → 选项
- **答案**： → 正确答案
- **解析**： → 解析内容
- --- → 题目分隔
- > 材料内容 → 阅读材料

### 6.3 DOCX 解析器

- 使用 docx 库解析 Word 文件
- 识别标题样式（Heading 1/2/3）
- 提取表格（选项表格）
- 提取图片（内联图片）
- 提取公式（OMML → LaTeX 或 SVG）
- 解析规则与 Markdown 类似，基于文档结构和样式

---

## 七、校验规则

| 校验类型 | 规则 | 错误级别 |
|---------|------|---------|
| 必填 | 题干不能为空 | error |
| 必填 | 选项不能为空（选择题） | error |
| 必填 | 答案不能为空 | error |
| 格式 | 答案格式必须匹配题型 | error |
| 格式 | 选项键必须为 A/B/C/D… | error |
| 格式 | 单选题答案只能选一个 | error |
| 格式 | 多选题答案至少选两个 | error |
| 约束 | 题目数量至少 1 题 | error |
| 约束 | 材料引用必须存在 | error |
| 推荐 | 建议填写解析 | warning |
| 推荐 | 建议设置难度 | warning |

---

## 八、接口设计

| 接口 | 方法 | 用途 |
|------|------|------|
| /api/admin/importer/upload | POST | 上传导入文件 |
| /api/admin/importer/preview/:importId | GET | 获取解析预览结果 |
| /api/admin/importer/preview/:importId/question/:index | PUT | 修改某题 |
| /api/admin/importer/preview/:importId/question/:index | DELETE | 删除某题 |
| /api/admin/importer/confirm/:importId | POST | 确认导入 |
| /api/admin/importer/history | GET | 导入历史列表 |
| /api/admin/importer/history/:importId | GET | 导入详情 + 报告 |

---

*本文档定义 Importer 的架构设计。导入后的题目和试卷管理见 \docs/architecture/01-Content-Center.md\。自动化采集见 \docs/architecture/07-Chalk.md\，采集结果可作为 Importer 的输入源。*
