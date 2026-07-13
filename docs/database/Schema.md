# ExamHub 数据库表结构（Schema）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13
> **数据库：** PostgreSQL ≥ 15 / MySQL ≥ 8.0

---

## 一、约定

### 1.1 命名规范

| 规则 | 示例 |
|------|------|
| 表名：小写 + 下划线 | users, paper_questions |
| 字段名：小写 + 下划线 | created_at, exam_type |
| 主键：id（自增 BIGINT 或 UUID） | id BIGSERIAL PRIMARY KEY |
| 外键：{关联表}_id | user_id, paper_id |
| 软删除：deleted_at | nullable timestamp |
| 时间戳：created_at, updated_at | NOT NULL DEFAULT NOW() |

### 1.2 通用字段

大多数表包含以下通用字段：

`sql
created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW()
`

### 1.3 类型约定

| 业务含义 | SQL 类型 |
|---------|---------|
| 编号（Q000001） | VARCHAR(16) |
| JSON 数据 | JSONB (PG) / JSON (MySQL) |
| 富文本 | TEXT |
| 金额 | DECIMAL(10,2) |
| 枚举 | VARCHAR(32) |
| 标签 | JSONB (JSON Array) |
| URL | VARCHAR(512) |

---

## 二、内容相关表

### 2.1 materials（材料表）

`sql
CREATE TABLE materials (
    id              VARCHAR(16) PRIMARY KEY,         -- M000001
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,                    -- 富文本
    type            VARCHAR(32) NOT NULL DEFAULT 'reading',  -- reading / listening /图文
    question_ids    JSONB,                            -- 关联题目编号列表
    tags            JSONB,
    version         INT NOT NULL DEFAULT 1,
    status          VARCHAR(16) NOT NULL DEFAULT 'draft',  -- draft / published / deprecated
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 2.2 questions（题目表）

`sql
CREATE TABLE questions (
    id              VARCHAR(16) PRIMARY KEY,         -- Q000001
    type            VARCHAR(16) NOT NULL,             -- single_choice / multi_choice / true_false / fill_blank / essay
    content         TEXT NOT NULL,                    -- 题干，富文本
    options         JSONB,                            -- {A: "...", B: "..."}
    answer          JSONB NOT NULL,                   -- 因题型而异
    analysis        TEXT,                             -- 解析，富文本
    material_id     VARCHAR(16),                      -- FK → materials.id
    knowledge_points JSONB,                           -- ["知识点1", "知识点2"]
    difficulty      VARCHAR(8) NOT NULL DEFAULT 'medium',  -- basic / medium / hard
    source          VARCHAR(32) NOT NULL DEFAULT 'original', -- past_exam / mock / original
    year            INT,
    region          VARCHAR(64),
    exam_type       VARCHAR(16) NOT NULL,             -- national / provincial / career / teacher / postgraduate / cet
    subject         VARCHAR(64),
    tags            JSONB,
    version         INT NOT NULL DEFAULT 1,
    status          VARCHAR(16) NOT NULL DEFAULT 'draft',  -- draft / published / deprecated
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_question_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL
);
`

### 2.3 papers（试卷表）

`sql
CREATE TABLE papers (
    id              VARCHAR(16) PRIMARY KEY,         -- P000001
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    exam_type       VARCHAR(16) NOT NULL,
    year            INT,
    region          VARCHAR(64),
    subject         VARCHAR(64),
    difficulty      VARCHAR(8) NOT NULL DEFAULT 'medium',
    total_questions INT NOT NULL DEFAULT 0,
    total_score     DECIMAL(6,1),
    duration        INT,                              -- 建议用时（分钟）
    sections        JSONB,                            -- 分部分结构，支持 regular（常规部分）和 material_group（材料题组）两种 type；material_group 需携带 materialId
    tags            JSONB,
    cover_image     VARCHAR(512),
    version         INT NOT NULL DEFAULT 1,
    status          VARCHAR(16) NOT NULL DEFAULT 'draft',  -- draft / published / deprecated
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 2.4 paper_questions（试卷题目关联表）

`sql
CREATE TABLE paper_questions (
    paper_id        VARCHAR(16) NOT NULL,
    question_id     VARCHAR(16) NOT NULL,
    section_index   INT NOT NULL DEFAULT 0,           -- 第几个部分（对应 sections 数组索引）
     sort_order      INT NOT NULL DEFAULT 0,           -- 排序
     score           DECIMAL(6,1),                     -- 该题分数
     material_group_index INT,                         -- 材料题组内序号，归属于同一 material_group 的题目共享相同值（非材料题为 NULL）
     question_version_at_ref INT NOT NULL DEFAULT 1,   -- 引用时的题目版本
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (paper_id, question_id),
    CONSTRAINT fk_pq_paper FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    CONSTRAINT fk_pq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
`

### 2.5 collections（合集表）

`sql
CREATE TABLE collections (
    id              VARCHAR(16) PRIMARY KEY,         -- C000001
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    exam_type       VARCHAR(16) NOT NULL,
    year            INT,
    cover_image     VARCHAR(512),
    paper_count     INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    tags            JSONB,
    version         INT NOT NULL DEFAULT 1,
    status          VARCHAR(16) NOT NULL DEFAULT 'draft',  -- draft / published / deprecated
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 2.6 collection_papers（合集试卷关联表）

`sql
CREATE TABLE collection_papers (
    collection_id   VARCHAR(16) NOT NULL,
    paper_id        VARCHAR(16) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    paper_version_at_ref INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (collection_id, paper_id),
    CONSTRAINT fk_cp_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_paper FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
);
`

---

## 三、商品与订单表

### 3.1 products（商品表）

`sql
CREATE TABLE products (
    id              VARCHAR(16) PRIMARY KEY,         -- PR000001
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    cover_image     VARCHAR(512),
    price           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vip_price       DECIMAL(10,2),
    score_price     INT,                              -- 积分兑换所需积分
    type            VARCHAR(16) NOT NULL DEFAULT 'normal',  -- normal / vip_only / score_only
    is_flash_sale   BOOLEAN NOT NULL DEFAULT FALSE,
    flash_start     TIMESTAMP,
    flash_end       TIMESTAMP,
    flash_price     DECIMAL(10,2),
    status          VARCHAR(16) NOT NULL DEFAULT 'draft',   -- draft / pending / published / offline / deleted
    version         INT NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 3.2 product_resources（商品资源关联表）

`sql
CREATE TABLE product_resources (
    product_id      VARCHAR(16) NOT NULL,
    resource_id     VARCHAR(16) NOT NULL,             -- Paper.id 或 Collection.id
    resource_type   VARCHAR(16) NOT NULL,             -- 'paper' | 'collection'
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (product_id, resource_id, resource_type),
    CONSTRAINT fk_pr_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
`

### 3.3 orders（订单表）

`sql
CREATE TABLE orders (
    id              VARCHAR(16) PRIMARY KEY,         -- O000001
    order_no        VARCHAR(32) NOT NULL UNIQUE,      -- 对外订单号
    user_id         VARCHAR(16) NOT NULL,
    total_amount    DECIMAL(10,2) NOT NULL,
    pay_amount      DECIMAL(10,2) NOT NULL,
    payment_method  VARCHAR(32) DEFAULT 'wechat',
    status          VARCHAR(16) NOT NULL DEFAULT 'pending',  -- pending / paid / refunded / cancelled
    paid_at         TIMESTAMP,
    refund_at       TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
);
`

### 3.4 order_items（订单明细表）

`sql
CREATE TABLE order_items (
    id              BIGSERIAL PRIMARY KEY,
    order_id        VARCHAR(16) NOT NULL,
    product_id      VARCHAR(16) NOT NULL,
    product_name    VARCHAR(255) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id)
);
`

---

## 四、用户表

### 4.1 users（用户表）

`sql
CREATE TABLE users (
    id              VARCHAR(16) PRIMARY KEY,         -- U000001
    nickname        VARCHAR(64),
    avatar          VARCHAR(512),
    phone           VARCHAR(16) UNIQUE,
    email           VARCHAR(128) UNIQUE,
    password_hash   VARCHAR(256),
    wechat_openid   VARCHAR(64) UNIQUE,
    status          VARCHAR(16) NOT NULL DEFAULT 'active',  -- active / banned
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 4.2 vip_info（VIP 信息表）

`sql
CREATE TABLE vip_info (
    user_id         VARCHAR(16) PRIMARY KEY,
    start_at        TIMESTAMP NOT NULL,
    end_at          TIMESTAMP NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'active',  -- active / expired / cancelled
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_vip_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`

### 4.3 download_logs（下载记录表）

`sql
CREATE TABLE download_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(16) NOT NULL,
    order_id        VARCHAR(16),
    resource_id     VARCHAR(16) NOT NULL,
    resource_type   VARCHAR(16) NOT NULL,             -- 'paper' | 'collection'
    download_time   TIMESTAMP NOT NULL DEFAULT NOW(),
    ip              VARCHAR(45),
    user_agent      TEXT,
    token           VARCHAR(128),
    status          VARCHAR(16) NOT NULL,              -- success / failed
    fail_reason     VARCHAR(255),
    
    CONSTRAINT fk_dl_user FOREIGN KEY (user_id) REFERENCES users(id)
);
`

### 4.4 favorites（收藏表）

`sql
CREATE TABLE favorites (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(16) NOT NULL,
    resource_id     VARCHAR(16) NOT NULL,
    resource_type   VARCHAR(16) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE (user_id, resource_id, resource_type),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`

### 4.5 browse_history（浏览历史表）

`sql
CREATE TABLE browse_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(16) NOT NULL,
    resource_id     VARCHAR(16) NOT NULL,
    resource_type   VARCHAR(16) NOT NULL,
    browsed_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_bh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`

### 4.6 score_records（积分记录表）

`sql
CREATE TABLE score_records (
    id              BIGSERIAL PRIMARY KEY,
    user_id         VARCHAR(16) NOT NULL,
    score           INT NOT NULL,                     -- 正为增加，负为扣除
    type            VARCHAR(32) NOT NULL,              -- sign_in / purchase / consume / admin_adjust
    description     VARCHAR(255),
    order_id        VARCHAR(16),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_sr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`

### 4.7 download_tokens（下载 Token 表，可选持久化）

`sql
CREATE TABLE download_tokens (
    token           VARCHAR(128) PRIMARY KEY,
    user_id         VARCHAR(16) NOT NULL,
    resource_id     VARCHAR(16) NOT NULL,
    resource_type   VARCHAR(16) NOT NULL,
    order_id        VARCHAR(16),
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_dt_user FOREIGN KEY (user_id) REFERENCES users(id)
);
`

---

## 五、运营内容表

### 5.1 news（资讯表）

`sql
CREATE TABLE news (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    summary         VARCHAR(500),
    content         TEXT NOT NULL,
    category        VARCHAR(32) NOT NULL,              -- exam_info / registration / result / policy
    cover_image     VARCHAR(512),
    view_count      INT NOT NULL DEFAULT 0,
    status          VARCHAR(16) NOT NULL DEFAULT 'draft',  -- draft / published
    published_at    TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 5.2 banners（首页轮播表）

`sql
CREATE TABLE banners (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(128),
    image_url       VARCHAR(512) NOT NULL,
    link_url        VARCHAR(512),
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 5.3 official_links（官方网址表）

`sql
CREATE TABLE official_links (
    id              BIGSERIAL PRIMARY KEY,
    exam_type       VARCHAR(16) NOT NULL,
    name            VARCHAR(128) NOT NULL,
    url             VARCHAR(512) NOT NULL,
    description     VARCHAR(255),
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 5.4 friend_links（友情链接表）

`sql
CREATE TABLE friend_links (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(128) NOT NULL,
    url             VARCHAR(512) NOT NULL,
    logo            VARCHAR(512),
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 5.5 seo_info（SEO 信息表）

`sql
CREATE TABLE seo_info (
    id              BIGSERIAL PRIMARY KEY,
    page_url        VARCHAR(512) NOT NULL UNIQUE,
    title           VARCHAR(128),
    description     VARCHAR(512),
    keywords        VARCHAR(512),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 5.6 system_configs（系统配置表）

`sql
CREATE TABLE system_configs (
    config_key      VARCHAR(64) PRIMARY KEY,
    config_value    JSONB NOT NULL,
    description     VARCHAR(255),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 5.7 import_history（导入历史表）

`sql
CREATE TABLE import_history (
    id              VARCHAR(16) PRIMARY KEY,         -- IMP000001
    file_name       VARCHAR(255) NOT NULL,
    file_format     VARCHAR(8) NOT NULL,              -- json / markdown / docx
    file_size       INT,
    total_questions INT NOT NULL DEFAULT 0,
    success_count   INT NOT NULL DEFAULT 0,
    fail_count      INT NOT NULL DEFAULT 0,
    errors          JSONB,
    materials_count INT NOT NULL DEFAULT 0,
    image_count     INT NOT NULL DEFAULT 0,
    formula_count   INT NOT NULL DEFAULT 0,
    duration_ms     INT,
    status          VARCHAR(16) NOT NULL,              -- parsing / preview / confirmed / failed
    created_by      VARCHAR(16),                       -- AdminUser.id
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

---

## 六、管理端表

### 6.1 admin_users（管理员表）

`sql
CREATE TABLE admin_users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(64) NOT NULL UNIQUE,
    password_hash   VARCHAR(256) NOT NULL,
    nickname        VARCHAR(64),
    status          VARCHAR(16) NOT NULL DEFAULT 'active',  -- active / banned
    last_login_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 6.2 roles（角色表）

`sql
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(64) NOT NULL UNIQUE,
    description     VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 6.3 permissions（权限表）

`sql
CREATE TABLE permissions (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(64) NOT NULL UNIQUE,      -- 'question.create', 'order.view'
    name            VARCHAR(64) NOT NULL,
    type            VARCHAR(16) NOT NULL,              -- menu / operation / button
    parent_id       BIGINT,                           -- FK → permissions.id
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
`

### 6.4 admin_user_roles（管理员角色关联表）

`sql
CREATE TABLE admin_user_roles (
    admin_user_id   BIGINT NOT NULL,
    role_id         BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (admin_user_id, role_id),
    CONSTRAINT fk_aur_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_aur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
`

### 6.5 role_permissions（角色权限关联表）

`sql
CREATE TABLE role_permissions (
    role_id         BIGINT NOT NULL,
    permission_id   BIGINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
`

### 6.6 operation_logs（操作日志表）

`sql
CREATE TABLE operation_logs (
    id              BIGSERIAL PRIMARY KEY,
    admin_user_id   BIGINT NOT NULL,
    action          VARCHAR(64) NOT NULL,              -- create / update / delete / refund
    target_type     VARCHAR(32) NOT NULL,              -- order / product / question
    target_id       VARCHAR(32),
    detail          JSONB,
    ip              VARCHAR(45),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_ol_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);
`

---

*本文档定义 ExamHub 全部数据表结构。ER 关系图见 \docs/database/ER.md\，索引策略见 \docs/database/Index.md\。*
