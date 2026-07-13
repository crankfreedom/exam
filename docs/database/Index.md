# ExamHub 数据库索引策略

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、索引设计原则

| 原则     | 说明                          |
| ------ | --------------------------- |
| 高频查询优先 | 首页、搜索、分类等高频路径涉及的字段优先建索引     |
| 组合索引覆盖 | 多维筛选场景使用组合索引，避免索引合并         |
| 避免过度索引 | 写频繁的表控制索引数量（如 orders）       |
| 全文索引按需 | V1 使用 FULLTEXT，V2 接入搜索引擎后移除 |
| 外键索引   | 所有外键字段建索引                   |

---

## 二、索引清单

### 2.1 questions（题目表）

| 索引名                    | 类型       | 字段                | 用途             |
| ---------------------- | -------- | ----------------- | -------------- |
| idx_q_exam_type        | BTREE    | exam_type         | 按考试类型筛选        |
| idx_q_status           | BTREE    | status            | 按状态筛选          |
| idx_q_source           | BTREE    | source            | 按来源筛选          |
| idx_q_difficulty       | BTREE    | difficulty        | 按难度筛选          |
| idx_q_year             | BTREE    | year              | 按年份筛选          |
| idx_q_region           | BTREE    | region            | 按地区筛选          |
| idx_q_subject          | BTREE    | subject           | 按科目筛选          |
| idx_q_material_id      | BTREE    | material_id       | 按材料关联查询        |
| idx_q_exam_type_status | BTREE    | exam_type, status | 前端列表查询         |
| idx_q_exam_type_year   | BTREE    | exam_type, year   | 考试类型 + 年份筛选    |
| idx_q_created_at       | BTREE    | created_at        | 按创建时间排序        |
| idx_q_content_fulltext | FULLTEXT | content           | 全文搜索（V1，V2 移除） |

### 2.2 papers（试卷表）

| 索引名                         | 类型       | 字段                      | 用途             |
| --------------------------- | -------- | ----------------------- | -------------- |
| idx_p_exam_type             | BTREE    | exam_type               | 按考试类型筛选        |
| idx_p_status                | BTREE    | status                  | 按状态筛选          |
| idx_p_year                  | BTREE    | year                    | 按年份筛选          |
| idx_p_region                | BTREE    | region                  | 按地区筛选          |
| idx_p_difficulty            | BTREE    | difficulty              | 按难度筛选          |
| idx_p_subject               | BTREE    | subject                 | 按科目筛选          |
| idx_p_exam_type_status      | BTREE    | exam_type, status       | 前端列表           |
| idx_p_exam_type_year_status | BTREE    | exam_type, year, status | 多维筛选           |
| idx_p_created_at            | BTREE    | created_at              | 按上传时间排序        |
| idx_p_download_count        | BTREE    | —                       | 按下载量排序（应用层维护）  |
| idx_p_title_fulltext        | FULLTEXT | title, description      | 全文搜索（V1，V2 移除） |

### 2.3 paper_questions（试卷题目关联表）

| 索引名             | 类型    | 字段                   | 用途      |
| --------------- | ----- | -------------------- | ------- |
| idx_pq_paper    | BTREE | paper_id, sort_order | 按试卷查询题目 |
| idx_pq_question | BTREE | question_id          | 按题目反查试卷 |

### 2.4 collections（合集表）

| 索引名                    | 类型    | 字段                | 用途      |
| ---------------------- | ----- | ----------------- | ------- |
| idx_c_exam_type        | BTREE | exam_type         | 按考试类型筛选 |
| idx_c_status           | BTREE | status            | 按状态筛选   |
| idx_c_year             | BTREE | year              | 按年份筛选   |
| idx_c_exam_type_status | BTREE | exam_type, status | 前端列表    |
| idx_c_created_at       | BTREE | created_at        | 按创建时间排序 |

### 2.5 collection_papers（合集试卷关联表）

| 索引名               | 类型    | 字段                        | 用途      |
| ----------------- | ----- | ------------------------- | ------- |
| idx_cp_collection | BTREE | collection_id, sort_order | 按合集查询试卷 |
| idx_cp_paper      | BTREE | paper_id                  | 按试卷反查合集 |

### 2.6 products（商品表）

| 索引名                   | 类型       | 字段                                    | 用途         |
| --------------------- | -------- | ------------------------------------- | ---------- |
| idx_pr_status         | BTREE    | status                                | 按状态筛选      |
| idx_pr_type           | BTREE    | type                                  | 按商品类型筛选    |
| idx_pr_price          | BTREE    | price                                 | 按价格排序/筛选   |
| idx_pr_status_price   | BTREE    | status, price                         | 已发布商品按价格排序 |
| idx_pr_flash_sale     | BTREE    | is_flash_sale, flash_start, flash_end | 限时活动商品查询   |
| idx_pr_title_fulltext | FULLTEXT | title, description                    | 全文搜索（V1）   |

### 2.7 product_resources（商品资源关联表）

| 索引名              | 类型    | 字段                         | 用途      |
| ---------------- | ----- | -------------------------- | ------- |
| idx_prr_product  | BTREE | product_id                 | 按商品查资源  |
| idx_prr_resource | BTREE | resource_id, resource_type | 按资源反查商品 |

### 2.8 orders（订单表）

| 索引名               | 类型           | 字段              | 用途      |
| ----------------- | ------------ | --------------- | ------- |
| idx_o_user_id     | BTREE        | user_id         | 按用户查订单  |
| idx_o_order_no    | UNIQUE BTREE | order_no        | 订单号唯一索引 |
| idx_o_status      | BTREE        | status          | 按状态筛选   |
| idx_o_paid_at     | BTREE        | paid_at         | 按支付时间排序 |
| idx_o_user_status | BTREE        | user_id, status | 用户订单列表  |
| idx_o_created_at  | BTREE        | created_at      | 按下单时间排序 |

### 2.9 users（用户表）

| 索引名                 | 类型           | 字段            | 用途           |
| ------------------- | ------------ | ------------- | ------------ |
| idx_u_id            | UNIQUE BTREE | uid           | 用户id唯一       |
| idx_u_nickname      | string       | nickname      | 用户昵称         |
| idx_u_phone         | UNIQUE BTREE | phone         | 手机号唯一        |
| idx_u_email         | UNIQUE BTREE | email         | 邮箱唯一         |
| idx_u_wechat_openid | UNIQUE BTREE | wechat_openid | 微信 openid 唯一 |
| idx_u_status        | BTREE        | status        | 按状态筛选        |
| idx_u_created_at    | BTREE        | created_at    | 按注册时间排序      |

### 2.10 运营相关表

| 表              | 索引名                    | 类型    | 字段                     | 用途        |
| -------------- | ---------------------- | ----- | ---------------------- | --------- |
| download_logs  | idx_dl_user            | BTREE | user_id                | 用户下载历史    |
| download_logs  | idx_dl_time            | BTREE | download_time          | 按时间查询     |
| download_logs  | idx_dl_user_resource   | BTREE | user_id, resource_id   | 下载权限校验    |
| favorites      | idx_fav_user           | BTREE | user_id, created_at    | 用户收藏列表    |
| browse_history | idx_bh_user            | BTREE | user_id, browsed_at    | 用户浏览历史    |
| score_records  | idx_sr_user            | BTREE | user_id, created_at    | 用户积分记录    |
| news           | idx_n_category         | BTREE | category               | 按分类查询     |
| news           | idx_n_status_published | BTREE | status, published_at   | 已发布资讯列表   |
| official_links | idx_ol_exam_type       | BTREE | exam_type, sort_order  | 按考试类型查询   |
| banners        | idx_b_active_sort      | BTREE | is_active, sort_order  | 有效轮播排序    |
| import_history | idx_ih_status          | BTREE | status                 | 按导入状态查询   |
| import_history | idx_ih_creator         | BTREE | created_by, created_at | 按操作人查询    |
| operation_logs | idx_ol_admin           | BTREE | admin_user_id          | 按管理员查操作记录 |
| operation_logs | idx_ol_target          | BTREE | target_type, target_id | 按操作目标查记录  |
| operation_logs | idx_ol_created         | BTREE | created_at             | 按时间查询     |

### 2.11 管理端权限表

| 表                | 索引名             | 类型           | 字段            | 用途     |
| ---------------- | --------------- | ------------ | ------------- | ------ |
| admin_users      | idx_au_username | UNIQUE BTREE | username      | 登录查询   |
| admin_user_roles | idx_aur_admin   | BTREE        | admin_user_id | 查用户的角色 |
| admin_user_roles | idx_aur_role    | BTREE        | role_id       | 查角色的用户 |
| role_permissions | idx_rp_role     | BTREE        | role_id       | 查角色的权限 |
| permissions      | idx_perm_code   | UNIQUE BTREE | code          | 权限编码唯一 |
| permissions      | idx_perm_parent | BTREE        | parent_id     | 查子权限   |

---

## 三、组合索引覆盖说明

### 3.1 最常用查询模式及覆盖索引

| 查询场景          | SQL 特征                                        | 推荐索引                        |
| ------------- | --------------------------------------------- | --------------------------- |
| 按考试类型查试卷（已发布） | exam_type = ?, status = 'published'           | idx_p_exam_type_status      |
| 按考试类型+年份筛选    | exam_type = ?, year = ?, status = 'published' | idx_p_exam_type_year_status |
| 用户订单列表        | user_id = ?, ORDER BY created_at DESC         | idx_o_user_status           |
| 分类页多维筛选       | exam_type + year + region + subject + status  | 组合索引调优，按区分度顺序               |
| 搜索（V1）        | MATCH(title) AGAINST(?)                       | idx_p_title_fulltext        |

### 3.2 索引选择规则

1. **等值条件放前面**：WHERE exam_type = ? AND year = ? → 索引 (exam_type, year)
2. **区分度高的字段放前面**：exam_type（基数 6）→ 区分度低；year（基数 10+）→ 区分度高
3. **范围条件放后面**：WHERE year BETWEEN ? AND ? → year 放组合索引末尾
4. **覆盖筛选优先于排序**：优先覆盖 WHERE 条件，再考虑 ORDER BY

---

## 四、全文索引说明（V1 过渡方案）

### 4.1 全文索引列表

| 表         | 索引                  | 引擎限制                              |
| --------- | ------------------- | --------------------------------- |
| questions | content             | MySQL: FULLTEXT; PG: tsvector GIN |
| papers    | title + description | 同上                                |
| products  | title + description | 同上                                |

### 4.2 MySQL 全文索引限制

- 最小索引词长：默认 4 个字符（中文无效，需配置 t_min_word_len = 1）
- 需使用 ngram 解析器：WITH PARSER ngram
- 中文搜索能力有限，V2 必须迁移至专用搜索引擎

### 4.3 PostgreSQL 替代方案（推荐）

`sql
-- 使用 tsvector + GIN 索引
ALTER TABLE questions ADD COLUMN search_vector tsvector 
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(content,''))) STORED;

CREATE INDEX idx_q_search_vector ON questions USING GIN(search_vector);

-- 查询
SELECT * FROM questions 
WHERE search_vector @@ plainto_tsquery('simple', '关键词');
`

---

## 五、索引管理策略

| 策略     | 说明                                           |
| ------ | -------------------------------------------- |
| 定期审查   | 每季度审查慢查询日志，调整索引                              |
| 索引冗余检测 | 使用工具检测重复索引（如 pt-duplicate-key-checker）       |
| 写优化    | 高写入表（download_logs, operation_logs）控制索引数 ≤ 5 |
| 大表索引创建 | 生产环境使用 ONLINE DDL / CONCURRENTLY 避免锁表        |
| 索引命名规范 | idx_{表缩写}_{字段} 或 uniq_{表缩写}_{字段}             |
| 迁移管理   | 所有索引变更通过 migration 脚本管理                      |

---

*本文档定义 ExamHub 的数据库索引策略。详细的表结构见 \docs/database/Schema.md\，ER 关系图见 \docs/database/ER.md\。*
