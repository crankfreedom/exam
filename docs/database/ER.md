# ExamHub 数据库 ER 图

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、全局 ER 图（文字描述）

\\\
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Material    │ 1──N  │    Question      │ N──N  │    Paper      │
│   (材料)      │───────│    (题目)        │───────│    (试卷)      │
└──────────────┘       └──────────────────┘       └──────┬───────┘
                                                            │ N
                                                            │
                                                            │ N
                                                    ┌───────▼───────┐
                                                    │  Collection    │
                                                    │   (合集)       │
                                                    └───────┬───────┘
                                                            │ 1
                                                            │
                                                            │ N
                                                    ┌───────▼───────┐
                                                    │   Product     │
                                                    │   (商品)       │
                                                    └───────┬───────┘
                                                            │ 1
                                                            │
                                                            │ N
                                                    ┌───────▼───────┐
                                                    │    Order      │
                                                    │   (订单)       │
                                                    └───────┬───────┘
                                                            │ N
                                                            │
                                                            │ 1
                                                    ┌───────▼───────┐
                                                    │    User       │
                                                    │   (用户)       │
                                                    └───────────────┘
\\\

---

## 二、核心业务 ER 图

### 2.1 内容模型

\\\
Material 1────N Question N────N Paper N────N Collection
  │               │  (PaperQuestion)     │  (CollectionPaper)
  │               │                      │
  │               │ 多对多通过关联表实现        │
  │               │                      │
  version         version                version

Material {
  id (PK)
  title
  content (TEXT)
  type
  version
  status
  created_at
  updated_at
}

Question {
  id (PK)
  type
  content (TEXT)
  options (JSON)
  answer (JSON)
  analysis (TEXT)
  material_id (FK → Material.id, nullable)
  knowledge_points (JSON)
  difficulty
  source
  year
  region
  exam_type
  subject
  tags (JSON)
  version
  status
  created_at
  updated_at
}

Paper {
  id (PK)
  title
  description (TEXT)
  exam_type
  year
  region
  subject
  difficulty
  total_questions
  total_score
  duration
  sections (JSON) — 支持 regular / material_group 两种 type，material_group 需含 materialId
 tags (JSON)
  cover_image
  version
  status
  created_at
  updated_at
}

PaperQuestion {
  paper_id (FK → Paper.id)
  question_id (FK → Question.id)
  section_index
  material_group_index (INT, nullable) — 材料题分组序号
 sort_order
  score
  PRIMARY KEY (paper_id, question_id)
}

Collection {
  id (PK)
  title
  description (TEXT)
  exam_type
  year
  cover_image
  paper_count
  total_questions
  tags (JSON)
  version
  status
  created_at
  updated_at
}

CollectionPaper {
  collection_id (FK → Collection.id)
  paper_id (FK → Paper.id)
  sort_order
  PRIMARY KEY (collection_id, paper_id)
}
\\\

### 2.2 商品与订单

\\\
Product       1────N  ProductResource     N────1  Paper/Collection
  │
  │ 1
  │
  │ N
  OrderItem                Order N────1 User
  │                          │
  └──────────────────────────┘

Product {
  id (PK)
  title
  description (TEXT)
  cover_image
  price (DECIMAL)
  vip_price (DECIMAL)
  score_price (INT)
  type
  is_flash_sale
  flash_start (datetime, nullable)
  flash_end (datetime, nullable)
  flash_price (DECIMAL, nullable)
  status
  version
  created_at
  updated_at
}

ProductResource {
  product_id (FK → Product.id)
  resource_id (string)    → Paper.id 或 Collection.id
  resource_type           → 'paper' 或 'collection'
  PRIMARY KEY (product_id, resource_id, resource_type)
}

Order {
  id (PK)
  order_no (string, unique)
  user_id (FK → User.id)
  total_amount (DECIMAL)
  pay_amount (DECIMAL)
  payment_method
  status
  paid_at (datetime, nullable)
  refund_at (datetime, nullable)
  created_at
  updated_at
}

OrderItem {
  order_id (FK → Order.id)
  product_id (FK → Product.id)
  product_name
  quantity
  unit_price (DECIMAL)
  subtotal (DECIMAL)
}
\\\

### 2.3 用户体系

\\\
User 1────N Order
  │ 1────N DownloadLog
  │ 1────0..1 VipInfo
  │ 1────N Favorite
  │ 1────N BrowseHistory
  │ 1────N ScoreRecord

User {
  id (PK)                   → U000001
  nickname
  avatar
  phone (unique, nullable)
  email (unique, nullable)
  password_hash (nullable)
  wechat_openid (unique, nullable)
  last_login_at
  status
  created_at
  updated_at
}

VipInfo {
  user_id (PK, FK → User.id)
  start_at (datetime)
  end_at (datetime)
  status                    → active / expired / cancelled
  created_at
  updated_at
}

DownloadLog {
  id (PK)
  user_id (FK → User.id)
  order_id (FK → Order.id, nullable)
  resource_id (string)
  resource_type
  download_time
  ip
  user_agent
  token
  status
  fail_reason (nullable)
}

Favorite {
  id (PK)
  user_id (FK → User.id)
  resource_id (string)
  resource_type
  created_at
  UNIQUE (user_id, resource_id, resource_type)
}

BrowseHistory {
  id (PK)
  user_id (FK → User.id)
  resource_id (string)
  resource_type
  browsed_at
}

ScoreRecord {
  id (PK)
  user_id (FK → User.id)
  score (INT)                → 正为增加，负为扣除
  type                       → sign_in / purchase / consume / admin_adjust
  description
  created_at
}
\\\

### 2.4 管理端权限

\\\
AdminUser N────N Role N────N Permission
  (AdminUserRole)    (RolePermission)

AdminUser {
  id (PK)
  username (unique)
  password_hash
  nickname
  status
  last_login_at
  created_at
  updated_at
}

Role {
  id (PK)
  name (unique)
  description
  created_at
  updated_at
}

Permission {
  id (PK)
  code (unique)              → 'question.create', 'order.view'
  name
  type                       → menu / operation / button
  parent_id (FK → Permission.id, nullable)
  sort_order
}

AdminUserRole {
  admin_user_id (FK → AdminUser.id)
  role_id (FK → Role.id)
  PRIMARY KEY (admin_user_id, role_id)
}

RolePermission {
  role_id (FK → Role.id)
  permission_id (FK → Permission.id)
  PRIMARY KEY (role_id, permission_id)
}

OperationLog {
  id (PK)
  admin_user_id (FK → AdminUser.id)
  action
  target_type
  target_id
  detail (JSON)
  ip
  created_at
}
\\\

### 2.5 运营内容

\\\
News {
  id (PK)
  title
  summary
  content (TEXT)
  category
  cover_image (nullable)
  view_count
  status
  published_at
  created_at
  updated_at
}

Banner {
  id (PK)
  title
  image_url
  link_url
  sort_order
  is_active
  created_at
  updated_at
}

OfficialLink {
  id (PK)
  exam_type
  name
  url
  description
  sort_order
  is_active
  created_at
  updated_at
}

FriendLink {
  id (PK)
  name
  url
  logo (nullable)
  sort_order
  is_active
  created_at
}

SystemConfig {
  config_key (PK)
  config_value (JSON)
  description
  updated_at
}

SeoInfo {
  id (PK)
  page_url (unique)
  title
  description
  keywords
  updated_at
}

ImportHistory {
  id (PK)
  file_name
  file_format
  file_size
  total_questions
  success_count
  fail_count
  errors (JSON)
  materials_count
  image_count
  formula_count
  duration_ms
  status
  created_by (FK → AdminUser.id)
  created_at
}
\\\

---

## 三、实体关系总结

| 关系 | 类型 | 说明 |
|------|------|------|
| Material → Question | 1:N | 一个材料关联多道题 |
| Question → Paper | N:N | 通过 PaperQuestion 关联表，带排序、分数和 material_group_index（材料题组序号） |
| Paper → Collection | N:N | 通过 CollectionPaper 关联表，带排序 |
| Collection → Product | 1:N | 一个合集可生成多个商品 |
| Paper → Product | 1:N | 一个试卷可直接被多个商品绑定 |
| Product → Order | 1:N | 一个商品对应多个订单 |
| Order → User | N:1 | 一个用户有多个订单 |
| User → VipInfo | 1:1 | 一个用户最多一个有效 VIP |
| User → DownloadLog | 1:N | 用户有多条下载记录 |
| User → Favorite | 1:N | 用户有多个收藏 |
| AdminUser → Role | N:N | 多对多通过关联表 |
| Role → Permission | N:N | 多对多通过关联表 |

---

*本文档定义 ExamHub 核心实体的 ER 关系。详细的表结构定义见 \docs/database/Schema.md\，索引策略见 \docs/database/Index.md\。*
