# ExamHub 主题系统（Theme）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、主题架构

ExamHub 使用 **CSS 自定义属性（CSS Variables）** 实现主题切换，支持浅色和深色两种模式。

### 1.1 技术方案

`scss
// 浅色模式（默认）
:root {
  --color-bg: #FFFFFF;
  --color-text: #1D1D1F;
  // ...
}

// 深色模式
[data-theme='dark'] {
  --color-bg: #000000;
  --color-text: #F5F5F7;
  // ...
}

// 跟随系统
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-bg: #000000;
    --color-text: #F5F5F7;
    // ...
  }
}
`

### 1.2 切换逻辑

`	ypescript
// 优先级：手动选择 > 系统偏好 > 默认浅色
const theme = localStorage.getItem('theme') // 'light' | 'dark' | null
  ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

document.documentElement.setAttribute('data-theme', theme);
`

| 策略 | 来源 | 优先级 |
|------|------|:-----:|
| 用户手动切换 | localStorage | 最高 |
| 系统偏好 | prefers-color-scheme | 中 |
| 默认 | 浅色 | 最低 |

---

## 二、颜色变量完整定义

### 2.1 浅色模式

`css
:root {
  /* 背景 */
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F5F5F7;
  --color-bg-tertiary: #E8E8ED;
  --color-bg-elevated: #FFFFFF;

  /* 文字 */
  --color-text: #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-text-tertiary: #A1A1A6;
  --color-text-inverse: #FFFFFF;

  /* 品牌 */
  --color-brand: #007AFF;
  --color-brand-hover: #0051D5;
  --color-brand-active: #0040B0;
  --color-brand-bg: #E8F0FE;

  /* 功能 */
  --color-success: #34C759;
  --color-success-bg: #E8F8ED;
  --color-warning: #FF9500;
  --color-warning-bg: #FFF3E0;
  --color-error: #FF3B30;
  --color-error-bg: #FFECEB;
  --color-info: #5AC8FA;
  --color-info-bg: #E8F7FF;

  /* 边框 */
  --color-border: #D2D2D7;
  --color-border-light: #E5E5EA;

  /* 遮罩 */
  --color-overlay: rgba(0, 0, 0, 0.4);

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
`

### 2.2 深色模式

`css
[data-theme='dark'] {
  /* 背景 */
  --color-bg: #000000;
  --color-bg-secondary: #1C1C1E;
  --color-bg-tertiary: #2C2C2E;
  --color-bg-elevated: #1C1C1E;

  /* 文字 */
  --color-text: #F5F5F7;
  --color-text-secondary: #98989D;
  --color-text-tertiary: #636366;
  --color-text-inverse: #000000;

  /* 品牌 */
  --color-brand: #0A84FF;
  --color-brand-hover: #409CFF;
  --color-brand-active: #70B8FF;
  --color-brand-bg: #1A2A44;

  /* 功能 */
  --color-success: #30D158;
  --color-success-bg: #1A2E1E;
  --color-warning: #FF9F0A;
  --color-warning-bg: #2E2218;
  --color-error: #FF453A;
  --color-error-bg: #2E1A1A;
  --color-info: #64D2FF;
  --color-info-bg: #1A2E3E;

  /* 边框 */
  --color-border: #38383A;
  --color-border-light: #48484A;

  /* 遮罩 */
  --color-overlay: rgba(0, 0, 0, 0.6);

  /* 阴影（深色模式下减小阴影可见度） */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}
`

---

## 三、组件主题化

### 3.1 按钮主题化示例

`css
.btn {
  background: var(--color-brand);
  color: var(--color-text-inverse);
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: var(--fs-body);
  padding: 0 24px;
  height: 48px;
  transition: background var(--duration-fast) var(--ease-in);
}

.btn:hover {
  background: var(--color-brand-hover);
}

.btn--secondary {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn--ghost {
  background: transparent;
  color: var(--color-brand);
  border: none;
}
`

### 3.2 卡片主题化示例

`css
.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  padding: var(--sp-4);
}
`

### 3.3 输入框主题化示例

`css
.input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  border-radius: 8px;
  padding: 0 12px;
  height: 36px;
  font-size: var(--fs-body);
}

.input:focus {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 2px var(--color-brand-bg);
  outline: none;
}
`

---

## 四、暗黑模式适配清单

### 4.1 需要适配的元素

| 元素 | 注意事项 |
|------|---------|
| 文字颜色 | 必须使用 var(--color-text) 系列，不硬编码 |
| 背景颜色 | 必须使用 var(--color-bg) 系列 |
| 边框 | 深色模式下边框颜色调亮，保持可见 |
| 阴影 | 深色模式下加深阴影，保持层次感 |
| 图片 | 可适当降低亮度（opacity: 0.9） |
| 遮罩 | 深色模式下加深，保持遮罩效果 |
| 品牌色 | 深色模式下品牌色稍亮（#007AFF → #0A84FF） |
| 标签颜色 | 深色模式下饱和度降低，避免刺眼 |
| Toast | 深色模式下背景加深，文字不变 |

### 4.2 不需要适配的元素

| 元素 | 原因 |
|------|------|
| 水印 | PDF 水印不跟随 UI 主题 |
| 商品封面图 | 封面图由管理员上传，不随主题改变 |
| 图标 | 图标颜色继承文字颜色，自动适配 |

---

## 五、过渡动画

### 5.1 主题切换动画

`css
html.color-theme-in-transition,
html.color-theme-in-transition * {
  transition: background-color 250ms ease,
              color 250ms ease,
              border-color 250ms ease,
              box-shadow 250ms ease !important;
}

html.color-theme-in-transition *::before,
html.color-theme-in-transition *::after {
  transition: background-color 250ms ease,
              color 250ms ease,
              border-color 250ms ease !important;
}
`

切换主题时给 <html> 加上 color-theme-in-transition class，在 transition 结束后移除。避免页面闪烁，同时带来平滑过渡。

---

## 六、组件颜色清单

### 6.1 常用组件颜色映射

| 组件 | 属性 | 浅色 Token | 深色 Token |
|------|------|-----------|-----------|
| 页面背景 | background | --color-bg | — |
| 卡片 | background | --color-bg-elevated | — |
| 导航栏 | background | --color-bg-secondary | — |
| 正文 | color | --color-text | — |
| 辅助文字 | color | --color-text-secondary | — |
| 链接 | color | --color-brand | — |
| 输入框边框 | border | --color-border | — |
| 分割线 | border-bottom | --color-border-light | — |
| 遮罩 | background | --color-overlay | — |
| 选中态背景 | background | --color-brand-bg | — |

---

## 七、新增组件主题规范

所有新增组件必须遵守以下规则：

1. **不硬编码颜色值** — 所有颜色必须使用 CSS 变量
2. **不直接使用品牌色十六进制** — 使用 ar(--color-brand) 而非 #007AFF
3. **深色模式必须测试** — 新增组件必须在两种模式下验证
4. **避免仅亮度变化的颜色** — 深色模式的颜色应有独立的色相选择
5. **图片需考虑暗黑适配** — 图片在深色模式下应通过 CSS filter 适当调暗

---

## 八、CSS 变量文件结构

`scss
// styles/
//   ├── variables/
//   │   ├── colors.scss       // 颜色变量（浅色）
//   │   ├── colors-dark.scss  // 颜色变量（深色）
//   │   ├── typography.scss   // 字体变量
//   │   ├── spacing.scss      // 间距变量
//   │   ├── shadow.scss       // 阴影变量
//   │   └── z-index.scss      // 层级变量
//   ├── base/
//   │   ├── reset.scss        // CSS Reset
//   │   └── global.scss       // 全局样式
//   ├── components/            // 组件样式
//   └── pages/                 // 页面样式
`

---

*本文档定义 ExamHub 的主题系统。详细的设计系统规范见 \docs/ui/Design-System.md\。*
