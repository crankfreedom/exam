# ExamHub V1 分步开发计划

> **版本：** v1.0.0
> **最后更新：** 2026-07-10
> 本项目由两大项目组成：**前端页面项目**（Vue3+Vite+TS）和 **后端服务项目**（Express+TS），共享 `packages/shared` 类型定义。

---

## 项目全景

```
D:\codex\exam\
├── packages/shared/      ← 前后端共享类型、常量、工具（两边的依赖基础）
├── backend/              ← 后端服务项目（Express + TypeScript）
└── frontend/             ← 前端页面项目（Vue3 + Vite + TypeScript）
```

共有 **25 个开发步骤**，按后端/前端两大项目分类组织。

---

## 第一部分：基础设施（前置，两边共用）

### 步骤 1：Monorepo 根配置

**目标：** 建立包管理工作空间，让 backend/、frontend/、packages/shared/ 三者可互相引用。

- [ ] 根目录 `package.json`（npm workspaces 配置）
- [ ] 根级 `tsconfig.json`（paths/aliases）
- [ ] 根级 ESLint + Prettier 配置
- [ ] `.gitignore`（排除 node_modules, dist, .env）
- [ ] `src/config/` 配置模块（配置值直接书写，参考 config/env.ts，不从 process.env 获取）
- [ ] root scripts（dev, build, lint, test）

### 步骤 2：packages/shared 共享模块

**目标：** 前后端共享的类型系统、常量枚举、工具函数。

- [ ] `package.json` + `tsconfig.json`（配置为可引用的 workspace 包）

- [ ] **src/types/** — 全部核心类型：
  - `question.ts`（Question, QuestionType, Option, Answer, QuestionStatus）
  - `paper.ts`（Paper, PaperSection, SectionType, PaperQuestion）
  - `collection.ts`（Collection, CollectionPaper）
  - `material.ts`（Material, MaterialType）
  - `product.ts`（Product, ProductType, ProductStatus, SaleConfig）
  - `order.ts`（Order, OrderItem, OrderStatus, PaymentMethod）
  - `user.ts`（User, VipInfo, UserStatus, UserRole）
  - `auth.ts`（LoginRequest, AuthToken, WechatUserInfo）
  - `admin.ts`（AdminUser, Role, Permission, AdminRole）
  - `common.ts`（Pagination, ApiResponse, IdPrefix, SortOrder）

- [ ] **src/constants/** — 枚举与常量：
  - `exam-types.ts`（考试类型：national/provincial/career/teacher/postgraduate/cet）
  - `difficulty.ts`（难度：basic/medium/hard）
  - `source.ts`（题目来源：past_exam/mock/original）
  - `limits.ts`（下载限制、Token 有效期等业务常量）
  - `status.ts`（所有业务状态枚举汇总）
  - `events.ts`（事件总线事件名常量）

- [ ] **src/utils/** — 通用工具函数：
  - `id-utils.ts`：编号生成/解析（generateId('Q') -> Q000001，parseId，isValidId）
  - `price-utils.ts`：金额格式化与计算
  - `time-utils.ts`：dayjs 封装
  - `validation.ts`：手机号/邮箱/URL 等共享校验规则

- [ ] **src/schema/** — JSON Schema 定义（导入器用）

---

---

## 第二部分：后端服务项目（backend/）

> 基于 Express + TypeScript 的 RESTful API 服务，模块化单体架构。共 **11 个步骤**。

| 步骤 | 名称 | 优先级 | 前置依赖 |
|:----:|------|:------:|:--------:|
| 3 | 后端项目初始化 | P0 | 1, 2 |
| 4 | 数据库迁移与种子数据 | P0 | 3 |
| 5 | 公共服务层（ID/加密/缓存/事件） | P0 | 3 |
| 6 | 中间件与全局配置 | P0 | 3 |
| 7 | 用户与认证模块 | P0 | 4, 5, 6 |
| 8 | 内容模块（Material/Question/Paper/Collection） | P0 | 4, 5, 6 |
| 9 | 商品与订单模块 | P0 | 7, 8 |
| 10 | 搜索模块 | P1 | 8 |
| 11 | 下载与 PDF 模块 | P0 | 7, 8, 9 |
| 12 | 管理后台模块（RBAC + 全部管理 API） | P1 | 7, 8, 9 |
| 13 | 导入器（Importer） | P2 | 8 |

---
### 步骤 3：后端项目初始化

**目标：** Express 应用可启动，健康检查通过。

- [ ] `backend/package.json`（依赖：express, typescript, cors, helmet, compression, zod, winston 等）
- [ ] `backend/tsconfig.json`（严格模式，paths 指向 shared）
- [ ] `backend/src/app.ts` — Express 入口：
  - 中间件链注册
  - 路由前缀 `/api/v1`
  - 全局错误处理
  - GET /health + GET /health/ready
- [ ] `backend/src/config/` - 配置模块（配置值直接书写、聚合导出，参考 config/env.ts）
- [ ] `backend/src/utils/` — 后端工具：
  - `response.ts`：统一响应格式 { code, data, message }
  - `errors.ts`：AppError 及业务异常子类
  - `pagination.ts`：分页参数解析
- [ ] `backend/src/database/connection.ts` — 数据库连接初始化

### 步骤 4：数据库迁移与种子数据

**目标：** 建表、索引、初始数据全部就绪，可直接在数据库中执行。

- [ ] `sql/001-init-schema.sql` — 创建全部 22 张表：
  - 内容：materials, questions, papers, paper_questions, collections, collection_papers
  - 商品订单：products, product_resources, orders, order_items
  - 用户：users, vip_info, download_logs, favorites, browse_history, score_records, download_tokens
  - 运营：news, banners, official_links, friend_links
  - 管理：admin_users, roles, permissions, admin_user_roles, role_permissions, operation_logs
  - 辅助：seo_info, system_configs, import_history
- [ ] `sql/002-init-indexes.sql` — 索引策略
- [ ] `sql/003-init-seeds.sql` — 种子数据：
  - 超级管理员账号 + 基础角色与权限（客服/管理员/超级管理员）
  - 系统默认配置 + 考试分类标签
  - 官方网址初始数据 + 友情链接
  - 示例试题（1 套完整试卷，覆盖全部 5 种题型 + 材料题）
  - 示例商品（普通 / VIP 专属 / 免费）

### 步骤 5：公共服务层

**目标：** 跨模块共享的基础服务全部就绪。

- [ ] `src/common/id-generator/` — 编号生成器：
  - 基于 Redis（或数据库表）实现分布式序列
  - 支持全部前缀：Q/P/C/PR/O/U/M/IMP
  - 每日重置 / 批量预申请
- [ ] `src/common/crypto/` — 加密服务：
  - `jwt.ts`：JWT 签发、验证、刷新（用户端 + 管理端两个 secret）
  - `aes-gcm.ts`：AES-GCM 加密/解密（PDF 传输加密）
  - `hash.ts`：bcrypt 封装
  - `token.ts`：随机 Token 生成
- [ ] `src/common/cache/` — Redis 缓存封装（get/set/del/ttl/incr + JSON 序列化 + 统一前缀）
- [ ] `src/common/event-bus/` — 内存事件总线（EventEmitter 封装）：
  - 事件列表：order.paid / resource.updated / user.registered / vip.changed
  - 异步处理 + 错误隔离 + 日志

### 步骤 6：中间件与全局配置

**目标：** 完整的请求预处理管道。

- [ ] `src/middleware/auth.ts` — JWT 认证（可选 / 强制 / 管理员三种模式）
- [ ] `src/middleware/permission.ts` — 权限校验
- [ ] `src/middleware/rate-limit.ts` — 频率限制
- [ ] `src/middleware/logger.ts` — 请求日志（winston）
- [ ] `src/middleware/validator.ts` — 参数校验（zod 中间件化）
- [ ] `src/middleware/error-handler.ts` — 全局异常处理

### 步骤 7：用户与认证模块

**目标：** 用户注册/登录/VIP/积分完整链路。

- [ ] 模块结构：`modules/user/`（controllers / services / repositories / dto / routes）

- [ ] **认证**（AuthController + AuthService）：
  - 微信扫码登录（openid 绑定自动注册）
  - 手机验证码登录、手机号+密码登录、邮箱+密码登录
  - 游客"支付即注册"流程（扫码支付 -> 自动创建账号 -> 绑定订单 -> 生成 JWT）
  - JWT 签发与自动刷新

- [ ] **用户管理**（UserController + UserService + UserRepository）：
  - 注册、信息查询/修改、封禁/解封

- [ ] **VIP 管理**（VipService + VipRepository）：
  - 开通、续费、取消、到期自动处理

- [ ] **积分系统**（ScoreService）：
  - 签到、购买奖励、兑换、管理员调整

- [ ] 路由：
  - POST /api/v1/auth/wx-login / sms-login / password-login
  - POST /api/v1/auth/register / refresh
  - GET/PUT /api/v1/user/profile
  - GET /api/v1/user/vip
  - GET /api/v1/user/scores

### 步骤 8：内容模块（Material/Question/Paper/Collection）

**目标：** 题目、试卷、合集、材料的全部 CRUD 与组装逻辑。

- [ ] 模块结构：`modules/content/` -> question/ / paper/ / collection/ / material/

- [ ] **Material 子模块**：CRUD，富文本内容，与题目的关联维护

- [ ] **Question 子模块**：
  - CRUD（5 种题型：单选/多选/判断/填空/主观题）
  - 选项/答案/解析/知识点标签
  - 富文本 + 图片 + 公式支持
  - 版本管理（修改后 version+1）、状态管理（draft / published / deprecated）
  - 多维筛选（考试类型/年份/地区/难度/题型/知识点/来源/状态）

- [ ] **Paper 子模块**：
  - CRUD，基本信息 + 分部分结构（regular / material_group 两种 section type）
  - 从题库选题（搜索 + 编号批量添加）
  - 拖拽排序（sort_order）
  - 材料题组（先选 material -> 再选关联 question）
  - 自动统计（总题数、各题型数量）
  - 版本管理

- [ ] **Collection 子模块**：
  - CRUD，从试卷库选择、排序
  - 自动统计（试卷总数、总题数）

### 步骤 9：商品与订单模块

**目标：** 商品定价、销售策略、支付流程。

- [ ] **Product 子模块**：
  - CRUD（支持绑定多个 Paper/Collection）
  - 定价体系（原价 / VIP 价 / 积分价）
  - 商品类型（normal / vip_only / score_only）
  - 限时活动（flash_start / flash_end / flash_price）
  - 状态流转（draft -> pending -> published -> offline -> deleted）
  - 免费商品（price=0）

- [ ] **Order 子模块**：
  - 订单创建（订单号生成、总价计算）
  - 状态流转（pending -> paid / refunded / cancelled）
  - 30 分钟超时自动取消（定时任务）
  - 支付回调处理（微信支付通知）
  - 重复支付自动退款
  - order.paid 事件触发 -> 下载权限生成 + 积分奖励 + 统计更新

- [ ] **微信支付集成**：统一下单 API / 支付回调 / 退款 API

### 步骤 10：搜索模块

**目标：** V1 基于数据库的搜索与多维筛选。

- [ ] `SearchService`：
  - DB 全文索引搜索（LIKE + MATCH AGAINST）
  - 搜索范围：试卷标题 / 合集标题 / 商品标题 / 试题内容 / 知识点
  - 结果分组：核心（试卷/合集/商品）+ 辅助（资讯/公告/知识点）
  - 多维筛选组合：考试类型 + 年份 + 地区 + 科目 + 资料类型 + 价格 + 难度 + 题量
  - 排序：最新 / 最热 / 价格升 / 价格降
  - 自动补全（热门搜索词，Redis 缓存）
  - 搜索历史记录

- [ ] `SearchController`：
  - GET /api/v1/search?q=...&examType=...&year=...&page=1&limit=20
  - URL 参数同步筛选状态

### 步骤 11：下载与 PDF 模块

**目标：** 下载权限验证、Token 签发、PDF 数据准备。

- [ ] **下载模块**：
  - 权限检查（已购买 / VIP 无限 / 下载次数剩余）
  - DownloadToken 生成（一次性，5 分钟有效）
  - 下载次数计数（普通用户 30 天 10 次，VIP 无限）
  - 下载日志记录
  - API：POST /token / GET /file/:token / GET /records / GET /quota

- [ ] **PDF 模块**：
  - 根据 Paper ID 组装完整 JSON（题目/选项/答案/解析/材料）
  - JSON 数据 AES-GCM 加密
  - PDF 版本管理（内容更新 version+1）
  - 缓存到 OSS + 内容更新时清除缓存
  - API：GET /pdf/data/:paperId / POST /pdf/cache/clear / GET /pdf/versions/:paperId

### 步骤 12：管理后台模块（RBAC + 全部管理 API）

**目标：** 权限体系 + 全部 12 个管理模块的后端 API。

- [ ] 管理端认证：账号密码登录，独立 JWT secret
- [ ] RBAC 体系：角色管理 / 权限管理（菜单/操作/按钮级）/ 角色分配 / 操作日志
- [ ] 内容管理 API：题库 / 试卷 / 合集 / 商品 / PDF 完整 CRUD（/api/v1/admin 前缀）
- [ ] 运营管理 API：资讯 / Banner / 官方网址 / 友情链接 CRUD
- [ ] SEO 管理 API：页面 SEO 配置 / Sitemap 手动刷新
- [ ] 订单管理 API：列表/详情/退款/补单/导出 CSV
- [ ] 用户管理 API：列表/VIP 操作/积分调整/封禁
- [ ] 系统设置 API：支付/短信/OSS/CDN/水印/积分规则/缓存清除
- [ ] 仪表盘 API：今日统计 / 近 7 天趋势 / 热门 Top 10 / 系统状态

### 步骤 13：导入器（Importer）

**目标：** 批量导入题目的完整管道。

- [ ] 文件上传（multer）
- [ ] JSON 解析器 / Markdown 解析器 / DOCX 解析器
- [ ] 统一转换为内部 JSON Schema
- [ ] 预览模式 -> 确认模式 -> 批量写入 + 编号生成
- [ ] 解析报告生成（成功数/失败数/图片数/公式数/材料组数/耗时）
- [ ] API：POST /upload / POST /preview / POST /confirm / GET /history

---

## 第三部分：前端页面项目（frontend/）

> 基于 Vue3 + Vite + TypeScript 的 SPA，同时包含用户端（13 页）和管理端（12 模块）。共 **10 个步骤**。

| 步骤 | 名称 | 优先级 | 前置依赖 |
|:----:|------|:------:|:--------:|
| 14 | 前端项目初始化 | P0 | 1, 2 |
| 15 | 设计系统与通用组件库 | P0 | 14 |
| 16 | 布局、路由与全局状态 | P0 | 14, 15 |
| 17 | 首页 + 分类页 + 搜索页 | P0 | 16 |
| 18 | 商品详情页 + 在线阅读页 + 支付页 | P0 | 16 |
| 19 | 个人中心 + VIP 中心 + 订单中心 + 下载中心 | P1 | 16 |
| 20 | 收藏中心 + 官方资讯页 + 官方导航页 | P1 | 16 |
| 21 | 管理端布局 + 登录 + 仪表盘 | P1 | 16 |
| 22 | 管理端内容管理页面 | P1 | 16, 21 |
| 23 | 管理端运营/系统/权限页面 | P2 | 16, 21 |
| 24 | 全局 UX（深色模式 + 响应式 + SEO，贯穿各步骤） | P1 | 各页面 |

### 步骤 14：前端项目初始化

**目标：** Vite 开发服务器可启动，热更新正常。

- [ ] `frontend/package.json`（依赖：vue3, vue-router, pinia, axios, less, kaTeX, lucide-vue-next）
- [ ] `frontend/vite.config.ts`（路径别名、proxy 代理到后端）
- [ ] `frontend/tsconfig.json`
- [ ] 前端目录结构：
  ```
  src/
  ├── pages/          # 页面组件（user/ + admin/）
  ├── components/     # 通用组件 + 业务组件
  ├── layouts/        # 布局容器
  ├── router/         # 路由配置 + 守卫
  ├── stores/         # Pinia 状态管理
  ├── api/            # API 层（axios 封装）
  ├── composables/    # 组合式函数
  ├── utils/          # 工具函数
  ├── styles/         # 样式（CSS 变量、主题、全局）
  └── types/          # 本地类型扩展
  ```

### 步骤 15：设计系统与通用组件库

**目标：** 完整的设计令牌 + 20+ 通用组件，全部支持深色模式。

- [ ] **CSS 变量系统（styles/）**：
  - `variables.css`：颜色（品牌/功能/中性）、字体（层级/栈）、间距（4px 基数）、阴影、圆角、z-index、动画
  - `theme.css`：浅色/深色模式变量映射
  - `reset.css`：基础样式重置
  - `global.css`：全局样式、响应式栅格、骨架屏动画
  - `responsive.css`：断点定义与媒体查询

- [ ] **通用组件库（components/common/）**：
  - 基础：AppButton（4 变体 3 尺寸）、AppInput（4 状态）、AppSelect、AppCheckbox、AppRadio、AppSwitch
  - 展示：AppCard、AppTag、AppBadge、AppAvatar、AppSkeleton
  - 反馈：AppModal、AppToast、AppProgress、AppEmpty、AppErrorBoundary
  - 导航：AppTabs、AppBreadcrumb、AppPagination、AppDropdown
  - 布局：AppTable、AppBottomSheet、AppTooltip
  - 全部使用 CSS 变量，自动适配深色模式

### 步骤 16：布局、路由与全局状态

**目标：** 页面容器 + 导航系统 + 状态管理 + API 层。

- [ ] **布局组件（layouts/）**：
  - `UserLayout.vue`：顶部导航（Logo/搜索/用户菜单）+ 内容区 + 底部
  - `AdminLayout.vue`：侧边栏（菜单树）+ 顶栏（面包屑/管理员信息）+ 内容区
  - `MobileLayout.vue`：底部 Tab 导航（首页/分类/资讯/我的）

- [ ] **路由配置（router/index.ts + guards.ts）**：
  - 用户端 13 个页面路由 + 管理端 12 个模块路由
  - 懒加载按页面分包
  - 路由守卫：认证检查 / 管理员角色 / 页面 title 设置

- [ ] **Pinia Stores（stores/）**：
  - `auth.ts`：用户认证状态、JWT 管理
  - `theme.ts`：深色模式偏好（跟随系统 / 手动切换，localStorage 持久化）
  - `ui.ts`：全局 UI 状态（loading / toast / modal）

- [ ] **API 层（api/）**：
  - `request.ts`：axios 实例（baseURL / 拦截器 / 统一错误处理）
  - `modules/`：按后端模块拆分（auth, content, product, order, search, download, admin/*）

### 步骤 17：首页 + 分类页 + 搜索页

**目标：** 用户访问入口三大页面，覆盖浏览/筛选/搜索。

- [ ] **首页**（/）：
  - 顶部导航栏（吸顶：Logo + 搜索框 + 登录/注册/用户头像）
  - 考试分类导航（6 类，图标+文字，点击带 examType 参数跳转分类页）
  - Banner 轮播（后台配置，无配置时隐藏）
  - 最新上传 / 热门下载 / 免费专区 / VIP 专区 / 专题合集 卡片列表（Skeleton 加载态）
  - 官方资讯（最近 5 条）
  - 底部：关于我们、友情链接、备案信息

- [ ] **分类页**（/category）：
  - 多维筛选区（考试类型/年份/地区/科目/资料类型/价格/难度/题量）
  - 标签式筛选控件（多选，已选项可单独清除，一键全部清除）
  - 结果卡片列表 + 排序切换（最新/最热/价格升/价格降）
  - URL 同步全部筛选参数（支持分享和浏览器后退）
  - 空结果提示 + 减少筛选条件建议

- [ ] **搜索页**（/search）：
  - 搜索输入框（自动聚焦，placeholder: "搜索试卷、合集……"）
  - 搜索结果分组：核心（试卷/合集/商品）+ 辅助（资讯/公告/知识点）
  - 搜索历史（localStorage 持久化）
  - 热门搜索词推荐
  - 空搜索词时显示历史 + 热门
  - 短词（<2 字符）不触发搜索

### 步骤 18：商品详情页 + 在线阅读页 + 支付页

**目标：** 核心交易流程三个页面，覆盖从浏览到下载的完整链路。

- [ ] **商品详情页**（/product/PR000001）：
  - 左：封面/标题/标签/简介/目录树/在线阅读入口
  - 右：价格卡片（原价/VIP价/积分价）+ 限时活动倒计时 + 购买/下载按钮
  - 下：题目试看（前 3~5 题含答案和解析）+ 相关推荐
  - 状态处理：已购买（立即下载）/ VIP（VIP免费标签）/ 已下架（隐藏按钮）/ 免费（免费下载）

- [ ] **在线阅读页**（/reader/P000001）：
  - 三栏布局：左（题号目录，高亮当前题）/ 中（题目内容）/ 右（答案解析）
  - 材料题渲染：先材料原文，再依次列出各题
  - 键盘导航（左右箭头切换题目）
  - 字号调整、深色模式切换、收藏题目、大图查看
  - 游客/注册用户第 6 题起锁定解析区域，引导购买
  - 公式渲染（KaTeX）

- [ ] **支付页**（/payment/PR000001）：
  - 订单确认信息（商品名/价格/数量）
  - 微信扫码展示 + 轮询订单状态
  - 支付成功 -> 自动跳转下载中心
  - 超时（30 分钟）-> 订单取消提示
  - 失败 -> 错误原因 + 重试

### 步骤 19：个人中心 + VIP 中心 + 订单中心 + 下载中心

**目标：** 用户管理与资源消费核心页面。

- [ ] **个人中心**（/user/profile）：
  - 头像/昵称/手机号/微信绑定状态
  - 等级标识 + VIP 到期时间
  - 入口导航：订单/下载/收藏/历史/VIP/积分/设置/退出

- [ ] **VIP 中心**（/vip）：
  - 权益展示卡片（无限下载/全部解析/VIP专区……）
  - 价格（199元/年）+ 立即开通按钮
  - 已开通用户：到期倒计时 + 续费

- [ ] **订单中心**（/user/orders）：
  - 列表（订单号/商品/金额/状态/时间）
  - 状态筛选（全部/待支付/已支付/已退款）
  - 待支付 -> 去支付 / 已支付 -> 去下载
  - 空订单占位

- [ ] **下载中心**（/user/downloads）：
  - 筛选标签（全部/下载中/已下载/已更新）
  - 资料卡片（封面/标题/下载次数/版本号/更新时间）
  - 下载按钮 + 剩余次数显示
  - 更新按钮（新版本时出现）
  - 下载进度条 + 失败重试
  - 次数耗尽提示 -> 升级 VIP

### 步骤 20：收藏中心 + 官方资讯页 + 官方导航页

**目标：** 辅助功能页面。

- [ ] **收藏中心**（/user/favorites）：收藏列表 / 取消收藏 / 已下架标签 / 空收藏占位
- [ ] **官方资讯页**（/news）：文章列表 + 分类筛选 + 详情（富文本渲染）
- [ ] **官方导航页**（/links）：按考试类型分类，官网名称+URL+功能说明，点击跳转新窗口

### 步骤 21：管理端布局 + 登录 + 仪表盘

**目标：** 管理端基础框架。

- [ ] 管理端登录页（/admin/login，账号密码，独立样式）
- [ ] AdminLayout（左侧菜单树 + 顶栏面包屑 + 内容区）
- [ ] 仪表盘页面：今日数据卡片（订单数/收入/VIP人数/新增资料/下载次数） + 7 天趋势图 + 热门 Top 10

### 步骤 22：管理端内容管理页面

**目标：** 核心内容管理界面。

- [ ] 题库管理：题目列表（表格） + 新建/编辑（富文本 + JSON 双模式） + 批量导入入口 + 预览
- [ ] 试卷管理：基本信息 + 分部分编辑 + 从题库选题 + 拖拽排序 + 自动统计 + 预览
- [ ] 合集管理：基本信息 + 选卷 + 排序
- [ ] 商品管理：定价 + 绑定资源 + 限时活动 + 上下架 + 复制
- [ ] PDF 管理：列表 + 手动生成 + 日志 + 版本管理

### 步骤 23：管理端运营/系统/权限页面

**目标：** 运营配置管理界面。

- [ ] 订单中心（列表/详情/退款/补单/导出 CSV）
- [ ] 用户中心（列表/详情/VIP管理/积分调整/封禁）
- [ ] 内容中心（资讯/Banner/网址/友链 CRUD）
- [ ] SEO 管理（页面 SEO 配置 + Sitemap 刷新）
- [ ] 系统设置（支付/短信/OSS/CDN/水印/积分/下载规则）
- [ ] 权限中心（管理员管理 / 角色管理 / 权限配置 / 操作日志）

### 步骤 24：全局 UX（贯穿所有页面开发）

**目标：** 所有页面统一体验，在开发各个页面时就逐步集成。

- [ ] **深色模式**：跟随系统 + 手动切换，localStorage 持久化，所有组件/页面适配
- [ ] **响应式适配**：手机（<768px 单栏+底部 Tab）/ 平板（768-1024px 两栏）/ PC（>1024px 完整布局）
- [ ] **SEO**：每个页面动态设置 Title/Description/Keywords + Sitemap + Robots.txt

---

## 第四部分：集成与部署

| 步骤 | 名称 | 优先级 | 前置依赖 |
|:----:|------|:------:|:--------:|
| 25 | Docker + CI/CD | P2 | 后端全部 + 前端全部 |
| 26 | 集成测试 + E2E | P2 | 25 |

### 步骤 25：Docker + CI/CD

**目标：** 生产级部署配置。

- [ ] 后端 Dockerfile（多阶段构建：builder -> runner）
- [ ] 前端 Dockerfile（Nginx 静态文件托管）
- [ ] docker-compose.yml（app + db + redis + nginx）
- [ ] Nginx 配置（反向代理 / SSL / 静态资源 / SPA 路由回退）
- [ ] GitHub Actions（lint -> test -> build -> deploy）
- [ ] 健康检查与监控（Sentry 接入）

### 步骤 26：集成测试 + E2E

**目标：** 核心流程端到端验证。

- [ ] 后端单元测试（各 Service 核心逻辑：价格计算 / 权限验证 / 编号生成 / 搜索）
- [ ] 用户端 E2E（Playwright）：首页 -> 搜索 -> 商品详情 -> 购买 -> 下载
- [ ] 管理端 E2E（Playwright）：登录 -> 创建题目 -> 创建试卷 -> 创建商品 -> 上架
- [ ] 权限验证：游客前 5 题可见，第 6 题锁定
- [ ] 响应式断点截图校验

---

## 五、建议执行节奏

整个项目按 **4 个迭代批次**推进，每个批次都是一个可运行、可验证的增量版本：

```
第 1 批（最小可用产品）：
  后端：步骤 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 11
  前端：步骤 14 -> 15 -> 16 -> 17 -> 18 -> 19
  产出：可浏览、搜索、购买、下载的完整链路

第 2 批（完整用户端）：
  后端：步骤 10
  前端：步骤 20 -> 更新步骤 24（深色模式/响应式）
  产出：全部 13 个用户端页面可用

第 3 批（管理端）：
  后端：步骤 12 -> 13
  前端：步骤 21 -> 22 -> 23
  产出：全部 12 个管理模块可用

第 4 批（工程化收尾）：
  步骤 25 -> 26
  产出：Docker 部署 + CI/CD + 测试覆盖
```

> 后端步骤 7、8、9、11 和前端步骤 17、18、19 是首批核心交付，建议后端先完成步骤 3-6 的骨架后，前后端可以并行开发各自模块。

---

*本文档按前端/后端两大项目组织，共 26 个步骤、4 个交付批次。每个步骤都是一个独立的可提交增量。*
