# ExamHub 设计系统（Design System）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、设计语言

ExamHub 的 UI 风格定位为**考试范 + Apple 风**的简洁学习风。

**关键词**：清晰、专注、专业、一致

### 1.1 设计原则

| 原则 | 说明 |
|------|------|
| 内容优先 | 界面退到幕后，让内容成为主角 |
| 减少噪声 | 克制用色、克制装饰、克制动效 |
| 信息层级 | 清晰的视觉层级，用户一眼能找到关键信息 |
| 一致性 | 组件、间距、色彩、交互模式全局统一 |
| 无障碍 | 符合 WCAG AA 标准，深色模式同样保证对比度 |

---

## 二、色彩系统

### 2.1 品牌色

| Token | 色值 | 用途 |
|-------|------|------|
| --color-brand | #007AFF | 品牌主色，按钮、链接、关键操作 |
| --color-brand-hover | #0051D5 | 品牌色悬停态 |
| --color-brand-active | #0040B0 | 品牌色点击态 |
| --color-brand-bg | #E8F0FE | 品牌色背景（浅色） |

### 2.2 功能色

| Token | 色值 | 用途 |
|-------|------|------|
| --color-success | #34C759 | 成功、已支付 |
| --color-warning | #FF9500 | 警告、限时活动 |
| --color-error | #FF3B30 | 错误、退款 |
| --color-info | #5AC8FA | 信息提示 |

### 2.3 中性色

| Token | 浅色模式 | 深色模式 | 用途 |
|-------|---------|---------|------|
| --color-bg | #FFFFFF | #000000 | 页面背景 |
| --color-bg-secondary | #F5F5F7 | #1C1C1E | 二级背景（卡片） |
| --color-bg-tertiary | #E8E8ED | #2C2C2E | 三级背景（悬停） |
| --color-text | #1D1D1F | #F5F5F7 | 主要文字 |
| --color-text-secondary | #6E6E73 | #98989D | 次要文字 |
| --color-text-tertiary | #A1A1A6 | #636366 | 辅助文字 |
| --color-border | #D2D2D7 | #38383A | 边框 |
| --color-border-light | #E5E5EA | #48484A | 浅边框 |
| --color-overlay | rgba(0,0,0,0.4) | rgba(0,0,0,0.6) | 遮罩层 |

---

## 三、字体系统

### 3.1 字体栈

`css
--font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 
             'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
`

### 3.2 字号层级

| Token | 大小 | 行高 | 字重 | 用途 |
|-------|------|------|------|------|
| --fs-caption | 12px | 16px | 400 | 辅助文字、标签 |
| --fs-body | 14px | 20px | 400 | 正文（默认） |
| --fs-body-large | 16px | 24px | 400 | 大号正文 |
| --fs-subhead | 15px | 20px | 600 | 小标题、卡片标题 |
| --fs-heading | 18px | 24px | 600 | 页面标题、商品标题 |
| --fs-heading-large | 24px | 32px | 700 | 大标题 |
| --fs-hero | 32px | 40px | 700 | 首页主标题 |
| --fs-price | 22px | 28px | 700 | 价格数字 |
| --fs-number | 14px | 20px | 400 | 数字内容（等宽） |

### 3.3 响应式字号适配

| 设备 | 正文 | 标题 |
|------|------|------|
| 手机 | 14px | 18px |
| 平板 | 15px | 20px |
| PC | 16px | 22px |

---

## 四、间距系统

### 4.1 间距尺度

基于 4px 基数：

| Token | 值 | 用途 |
|-------|-----|------|
| --sp-1 | 4px | 微间距 |
| --sp-2 | 8px | 紧凑间距 |
| --sp-3 | 12px | 内边距 |
| --sp-4 | 16px | 标准间距 |
| --sp-5 | 20px | 宽松间距 |
| --sp-6 | 24px | 卡片内边距 |
| --sp-8 | 32px | 区域间距 |
| --sp-10 | 40px | 大间距 |
| --sp-12 | 48px | 页面间距 |
| --sp-16 | 64px | 超大间距 |

### 4.2 页面布局

| 布局参数 | 手机 | 平板 | PC |
|---------|------|------|-----|
| 最大内容宽度 | 100% | 720px | 1200px |
| 页面左右内边距 | 16px | 24px | 32px |
| 卡片网格列数 | 1 | 2 | 3-4 |

---

## 五、组件规范

### 5.1 按钮

| 类型 | 高度 | 左右内边距 | 圆角 | 字号 |
|------|------|-----------|------|------|
| 大按钮 | 48px | 24px | 12px | 16px |
| 中按钮 | 36px | 16px | 8px | 14px |
| 小按钮 | 28px | 12px | 6px | 12px |

**样式变体**：

| 变体 | 背景 | 文字 | 边框 | 用法 |
|------|------|------|------|------|
| Primary | brand | white | — | 主要操作 |
| Secondary | transparent | text | border | 次要操作 |
| Ghost | transparent | brand | — | 文字按钮 |
| Danger | error | white | — | 危险操作 |

### 5.2 输入框

| 状态 | 边框 | 背景 |
|------|------|------|
| 默认 | border | bg |
| 聚焦 | brand 2px | bg |
| 错误 | error | error-bg |
| 禁用 | border-light | tertiary |
| 已填充 | border | bg |

### 5.3 卡片

| 属性 | 值 |
|------|-----|
| 圆角 | 8px |
| 阴影 | 0 1px 3px rgba(0,0,0,0.08) |
| 悬停阴影 | 0 4px 12px rgba(0,0,0,0.12) |
| 内边距 | 16px |
| 背景 | card-bg |
| 边框 | 1px solid border（可选） |

### 5.4 标签（Tag/Chip）

| 属性 | 值 |
|------|-----|
| 高度 | 24px |
| 横向内边距 | 8px |
| 圆角 | 4px |
| 字号 | 12px |
| 变体 | default / brand / success / warning / error |

### 5.5 骨架屏（Skeleton）

| 属性 | 值 |
|------|-----|
| 背景色 | bg-tertiary |
| 动画 | 渐变闪烁（loading shimmer） |
| 圆角 | 4px |
| 持续时间 | 1.5s infinite |

---

## 六、布局组件

### 6.1 页面容器

`css
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

@media (max-width: 1024px) {
  .page-container { padding: 0 24px; }
}

@media (max-width: 768px) {
  .page-container { padding: 0 16px; }
}
`

### 6.2 卡片网格

`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
`

### 6.3 响应式断点

| 断点 | 范围 | 布局 |
|------|------|------|
| --bp-mobile | < 768px | 单栏、底部 Tab |
| --bp-tablet | 768px - 1024px | 两栏、左侧筛选 |
| --bp-desktop | > 1024px | 多栏、完整布局 |

---

## 七、组件库

| 组件 | 状态 | 说明 |
|------|:----:|------|
| Button | ✓ | 多种尺寸和变体 |
| Input | ✓ | 文本、数字、密码、搜索 |
| Select | ✓ | 下拉选择器 |
| Checkbox | ✓ | 多选 |
| Radio | ✓ | 单选 |
| Switch | ✓ | 开关（暗黑模式切换） |
| Tag | ✓ | 标签、状态标识 |
| Badge | ✓ | 角标 |
| Card | ✓ | 内容卡片 |
| Modal | ✓ | 弹窗 |
| BottomSheet | ✓ | 底部弹出 |
| Toast | ✓ | 轻提示 |
| Skeleton | ✓ | 骨架屏 |
| Pagination | ✓ | 分页 |
| Progress | ✓ | 进度条 |
| Tabs | ✓ | 选项卡 |
| Breadcrumb | ✓ | 面包屑 |
| Tooltip | ✓ | 文字提示 |
| Dropdown | ✓ | 下拉菜单 |
| Table | ✓ | 表格（管理端） |
| Form | ✓ | 表单（含校验） |
| Empty | ✓ | 空状态占位 |
| ErrorBoundary | ✓ | 错误边界 |

---

## 八、阴影与层级

### 8.1 阴影层级

| Token | 值 | 用途 |
|-------|-----|------|
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.06) | 卡片微阴影 |
| --shadow-md | 0 4px 12px rgba(0,0,0,0.08) | 下拉菜单、弹窗 |
| --shadow-lg | 0 8px 24px rgba(0,0,0,0.12) | Modal、Bottom Sheet |
| --shadow-xl | 0 12px 48px rgba(0,0,0,0.16) | 通知弹窗 |

### 8.2 z-index 层级

| Token | 值 | 用途 |
|-------|-----|------|
| --z-dropdown | 100 | 下拉菜单 |
| --z-sticky | 200 | 吸顶导航 |
| --z-overlay | 300 | 遮罩层 |
| --z-modal | 400 | 弹窗 |
| --z-toast | 500 | Toast 通知 |
| --z-tooltip | 600 | Tooltip |

---

## 九、动画规范

| Token | 持续时间 | 缓动 | 用途 |
|-------|---------|------|------|
| --duration-fast | 150ms | ease-in | 按钮点击、悬停 |
| --duration-normal | 250ms | ease-out | 展开/折叠、弹窗 |
| --duration-slow | 350ms | ease | 页面切换 |
| --ease-in | cubic-bezier(0.4, 0, 1, 1) | — | — |
| --ease-out | cubic-bezier(0, 0, 0.2, 1) | — | — |
| --ease-in-out | cubic-bezier(0.4, 0, 0.2, 1) | — | — |

---

## 十、图标

- 使用 **Lucide Icons** 作为主要图标库
- 尺寸：16px（内联）/ 20px（按钮）/ 24px（导航）/ 32px（空状态）
- 颜色：继承父元素文字颜色或使用 color 属性

---

*本文档定义 ExamHub 的设计系统规范。主题与暗黑模式见 \docs/ui/Theme.md\，交互细节见 \docs/product/04-Interaction.md\。*
