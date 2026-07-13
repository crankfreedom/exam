# ExamHub 数据库规范

## 通用规则
- 表名：小写 + snake_case（users, paper_questions）
- 字段名：小写 + snake_case（created_at, exam_type）
- 主键：id（BIGSERIAL 或 VARCHAR(16) 唯一编号）
- 外键：{关联表}_id（user_id, paper_id）
- 软删除：deleted_at（TIMESTAMP, nullable）
- 时间戳：created_at, updated_at（NOT NULL DEFAULT NOW()）

## 数据类型约定
编号：VARCHAR(16) | JSON：JSONB (PG) / JSON (MySQL) | 富文本：TEXT
金额：DECIMAL(10,2) | 枚举：VARCHAR(32) | 标签：JSONB | URL：VARCHAR(512)

## 编号系统
Q(题目) P(试卷) C(合集) PR(商品) O(订单) U(用户) M(材料)
规则：前缀 + 6 位数字补齐零，不可复用，统一服务生成

## 索引策略
- 高频查询字段优先
- 多维筛选组合索引（等值字段放前面，区分度高的放前面）
- 写频繁表索引数 <= 5
- 外键必须建索引
- V1 用 FULLTEXT/PG tsvector，V2 迁移搜索引擎

## Migration 规范
- 所有结构变更通过 Migration 管理
- Migration 必须可回滚
- 生产环境使用 ONLINE DDL / CONCURRENTLY

## 核心表分组
内容：materials, questions, papers, paper_questions, collections, collection_papers
商品订单：products, product_resources, orders, order_items
用户：users, vip_info, download_logs, favorites, browse_history, score_records, download_tokens
运营：news, banners, official_links, friend_links, seo_info, system_configs, import_history
管理端：admin_users, roles, permissions, admin_user_roles, role_permissions, operation_logs
