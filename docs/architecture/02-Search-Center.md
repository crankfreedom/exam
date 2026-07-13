# ExamHub 搜索中心（Search Center）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

搜索中心负责 ExamHub 全部内容的搜索、筛选、推荐功能。V1 阶段使用数据库全文索引作为过渡方案，V2+ 接入 Elasticsearch 或 Meilisearch。

---

## 二、搜索范围

| 内容类型 | 可搜索字段 | 权重 |
|---------|-----------|------|
| Paper（试卷） | 标题、描述、题目标题、知识点 | 高 |
| Collection（合集） | 标题、描述 | 高 |
| Product（商品） | 标题、描述 | 高 |
| Question（题目） | 题干、选项、解析、知识点 | 中 |
| News（资讯） | 标题、摘要、正文 | 中 |
| Knowledge（知识点） | 名称、描述 | 低 |

**搜索结果分类**：
1. 主结果：Paper / Collection / Product（资料相关）
2. 辅结果：News / Knowledge（资讯和知识）

---

## 三、筛选体系

### 3.1 筛选维度

所有筛选条件可多选、可组合：

| 维度 | 可选项 | 适用场景 |
|------|--------|---------|
| 考试类型 | 国考 / 省考 / 事业单位 / 教师 / 考研 / 四六级 | 全部 |
| 年份 | 数字（2020-2025） | 试卷、合集 |
| 地区 | 省份/直辖市列表 | 省考、事业单位 |
| 科目 | 行测 / 申论 / 职测 / 综应 / 英语 / 政治… | 试卷 |
| 资料类型 | 历年真题 / 模拟卷 / 高频考点 / 专项训练 / 行测 / 申论 | 试卷、合集 |
| 价格区间 | 免费 / 1-10元 / 10-50元 / 50元以上 | 商品 |
| 难度 | 基础 / 中等 / 困难 | 试卷 |
| 题量 | 1-50题 / 50-100题 / 100题以上 | 试卷、合集 |

### 3.2 排序方式

| 排序 | 说明 |
|------|------|
| 最新 | 按发布时间倒序 |
| 最热 | 按下载量/浏览量倒序 |
| 价格升序 | 商品价格从低到高 |
| 价格降序 | 商品价格从高到低 |
| 相关度 | 搜索相关性排序（仅搜索时可用） |

---

## 四、V1 实现方案（数据库全文索引）

### 4.1 索引策略

`sql
-- Paper 全文索引
CREATE FULLTEXT INDEX idx_paper_search ON papers (title, description);

-- Question 全文索引
CREATE FULLTEXT INDEX idx_question_search ON questions (content);

-- Product 全文索引
CREATE FULLTEXT INDEX idx_product_search ON products (title, description);
`

### 4.2 搜索查询

`sql
-- 搜索试卷
SELECT * FROM papers 
WHERE MATCH(title, description) AGAINST(:keyword IN BOOLEAN MODE)
  AND exam_type IN (:examTypes)
  AND year BETWEEN :yearStart AND :yearEnd
  AND status = 'published'
ORDER BY 
  CASE 
    WHEN title LIKE :exactMatch THEN 0
    WHEN MATCH(title) AGAINST(:keyword) > 0 THEN 1
    ELSE 2
  END,
  published_at DESC
LIMIT :limit OFFSET :offset;
`

### 4.3 局限与过渡

| 局限 | 说明 | V2 方案 |
|------|------|---------|
| 不支持拼音/模糊 | 只能精确匹配关键词 | Elasticsearch 拼音分词 |
| 不支持同义词 | 如"行测"="行政职业能力测验" | ES 同义词词典 |
| 不支持权重调节 | 无法细调各字段权重 | ES 可配置权重 |
| 不支持纠错 | "工务员" 不会提示 "公务员" | ES 模糊查询 |
| 性能上限 | 数据量大时全文本索引性能下降 | ES 分布式搜索 |

---

## 五、V2+ 搜索引擎方案

### 5.1 选型

| 引擎 | 优势 | 劣势 | 推荐场景 |
|------|------|------|---------|
| Elasticsearch | 生态丰富，功能强大 | 资源消耗大，配置复杂 | 大规模搜索 |
| Meilisearch | 开箱即用，配置简单 | 功能相对较少 | 中小规模搜索 |

**推荐**：V2 初期选用 Meilisearch，数据量大后迁移至 Elasticsearch。

### 5.2 Meilisearch 索引设计

| Index | 文档字段 | 可搜索字段 | 筛选字段 | 排序字段 |
|-------|---------|-----------|---------|---------|
| papers | id, title, description, examType, year, region, subject | title, description | examType, year, region | year, createdAt |
| collections | id, title, description, examType, year | title, description | examType, year | createdAt |
| products | id, title, description, price, vipPrice | title, description | price | price, createdAt |
| questions | id, content, knowledgePoints, examType | content, knowledgePoints | examType, difficulty | — |
| news | id, title, summary, content, category | title, summary, content | category | publishedAt |

---

## 六、推荐系统

### 6.1 V1 推荐策略（规则驱动）

| 区域 | 推荐策略 |
|------|---------|
| 首页热门下载 | 按下载量排序（7天/30天/全部） |
| 首页最新上传 | 按发布时间倒序 |
| 首页免费专区 | 商品价格 = 0，按下载量排序 |
| 首页专题合集 | 后台手动配置 |
| 商品详情相关推荐 | 同考试类型 + 同科目，按下载量排序 |
| 商品详情购买推荐 | 购买了该商品的用户也买了…（V2） |

### 6.2 V2+ 推荐策略

- 基于协同过滤的推荐
- 基于内容和标签的推荐
- 个性化推荐首页
- "猜你喜欢" 模块

---

## 七、接口设计

### 7.1 搜索接口

`
GET /api/search?q=关键词&type=paper&examType=国考&year=2024&sort=latest&page=1&pageSize=20
`

**响应**：

`json
{
  "data": {
    "main": {
      "items": [...],
      "total": 156,
      "page": 1,
      "pageSize": 20
    },
    "secondary": {
      "news": [...],
      "knowledge": [...]
    }
  }
}
`

### 7.2 筛选接口

`
GET /api/category/filters?examType=国考
`

**响应**：返回当前考试类型下所有可用的筛选选项和计数。

---

*本文档定义搜索中心的架构设计。V1 使用数据库全文索引过渡，V2 至少升级至 Meilisearch。*
