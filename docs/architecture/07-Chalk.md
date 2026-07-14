# ExamHub Chalk 采集器（Chalk）

> **文档版本：** v1.2.0
> **最后更新：** 2026-07-13

---

## 一、概述

Chalk 是 ExamHub 的自动化内容采集子系统。与 Importer（手动导入）不同，Chalk 通过 Selenium WebDriver 自动化浏览器操作，从外部题库网站（如粉笔网）批量采集试题数据，生成中间数据文件供后续导入流程使用。

Chalk 解决的核心问题是：在 V1 阶段需要快速积累大量真题内容，纯手工导入效率不足。通过自动化爬取，管理员只需触发一次请求即可批量获取整套试卷的题目、选项、答案、解析、考点、来源、统计等完整数据。

---

## 二、设计原则

1. **进程隔离** - 爬取任务运行在独立子进程中，不阻塞主 Express 服务
2. **自动化优先** - 登录、导航、答题、提交、提取全流程自动化
3. **中间产物** - 采集结果先保存为本地 JS 文件，再通过 Importer 导入内容中心
4. **可配置** - 采集数量、目标来源等参数可配置
5. **安全凭证** - 第三方网站凭证直接书写在 config/chalk.ts 中（参考 config/env.ts）

---

## 三、与 Importer 的关系

Chalk 和 Importer 共同构成 ExamHub 的内容获取管道，分工如下：

| 维度 | Chalk | Importer |
|------|-------|----------|
| 获取方式 | 自动化爬取外部网站 | 管理员手动上传文件 |
| 数据来源 | 粉笔网等第三方题库 | JSON / Markdown / DOCX |
| 输出格式 | 本地 JS 文件（中间产物） | 统一 JSON Schema |
| 人工介入 | 仅触发和验收 | 上传、预览、修改、确认 |
| 适用场景 | 批量获取标准化真题 | 精确导入特定试卷 |

内容获取管道整体流程：

```
External Source (fenbi.com)
  -> Chalk (Selenium 爬取)
  -> 本地 JS 文件（中间产物）
  -> Importer（格式转换 + 校验）
  -> Content Center（Question -> Paper -> Collection）
```

---

## 四、模块结构

### 4.1 代码文件

| 文件 | 层级 | 职责 |
|------|------|------|
| `routes/chalk.ts` | 路由层 | 定义 API 路由，挂载到 `/chalk` 前缀 |
| `controller/chalk.ts` | 控制器层 | 接收请求，调用 Access 层，返回响应 |
| `access/chalk.ts` | 访问层 | 通过 `child_process.fork` 创建子进程执行爬取任务 |
| `task/chalkCreateExamPaper.ts` | 任务层 | 子进程入口，编排爬取流程 |
| `models/Chalk.ts` | 模型层 | Selenium WebDriver 封装，实现页面操作和数据提取 |
| `utils/save.ts` | 工具层 | 数据持久化，将采集结果保存为本地文件 |

### 4.2 调用链路

```
HTTP Request (POST /chalk/create/examination)
  -> routes/chalk.ts
  -> controller/chalk.ts (createExamination)
  -> access/chalk.ts (createExamination)
  -> child_process.fork(task/chalkCreateExamPaper.ts)
  -> models/Chalk.ts (login -> examinationAnwser -> getExamQuestion)
  -> utils/save.ts (saveArticle / saveImage)
  -> process.send({ code: '000000' })
  -> HTTP Response
```

### 4.3 进程模型

主 Express 进程通过 `child_process.fork` 创建子进程执行爬取任务：

- 主进程：接收 HTTP 请求 -> fork 子进程 -> 监听子进程消息 -> 返回响应
- 子进程：实例化 WebDriver -> 执行爬取流程 -> 保存数据 -> `process.send` 通知完成

子进程通过 `execArgv: ["-r", "ts-node/register"]` 直接运行 TypeScript 文件，采集数量通过 `env.num` 传入。

---

## 五、采集流程

### 5.1 整体流程

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 管理员触发 │ -> │ 启动子进程 │ -> │ 登录目标站 │ -> │ 智能组卷   │ -> │ 提交试卷   │
│ API 请求  │   │ fork     │   │ Selenium │   │ 自动答题   │   │ 获取答案版 │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                                    │
                                                                    ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 保存到本地 │ <- │ 提取统计数据│ <- │ 提取解析  │ <- │ 逐题提取   │
│ JS 文件   │   │ 考点/来源  │   │ 答案/选项  │   │ 题干/题型   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### 5.2 步骤详解

#### 步骤 1：触发采集

管理员在后台调用 `POST /chalk/create/examination`，传入 `num`（采集套数，默认 1）。

#### 步骤 2：启动子进程

Access 层通过 `child_process.fork` 创建子进程，传入 `num` 作为子进程参数。子进程独立运行，不影响主服务的请求处理。

#### 步骤 3：登录目标网站

- 实例化 Chrome WebDriver
- 打开粉笔网首页（`https://www.fenbi.com/page/home`）
- 自动填写账号密码
- 勾选用户协议
- 点击登录
- 获取并设置 Cookies

#### 步骤 4：智能组卷

- 导航到行测题库目录页（`https://www.fenbi.com/spa/tiku/guide/catalog/xingce`）
- 点击「智能组卷」
- 选择不限年份
- 等待试卷加载完成

#### 步骤 5：提交试卷

- 点击提交按钮
- 确认提交
- 等待页面切换到答案版本

#### 步骤 6：逐题提取

对每道题目，提取以下数据：

| 数据字段 | 提取方式 | 说明 |
|---------|---------|------|
| rank | CSS 选择器获取文本 | 题目序号 |
| type | CSS 选择器获取文本 | 题型（单选题/多选题等） |
| materialTitle | CSS 选择器（可能不存在） | 材料题标题 |
| materials | 遍历材料段落，提取 HTML | 材料内容 |
| question | 遍历题干段落，提取 HTML | 题干内容（含图片） |
| options | 遍历选项，提取前缀和内容 | 选项列表 |
| correct | CSS 选择器获取文本 | 正确答案 |
| analysis | 解析模块，提取详情 | 答案解析 |
| keypoint | 考点模块，获取考点名称 | 考点 |
| origin | 来源模块，获取来源信息 | 题目来源 |
| statistic | 统计模块，遍历统计数据 | 答题统计 |

#### 步骤 7：图片处理

- 对题目中的图片元素滚动到可视区域
- 截图获取 base64 数据
- 通过 Save 工具保存为 PNG 文件（UUID 命名）
- 记录图片宽高信息

#### 步骤 8：保存数据

- 将整套试卷数据（key, name, pageUrl, anwserUrl, articles）通过 Save 工具保存为本地 JS 文件
- 文件路径：`task/examination/{科目}/{key}.js`
- 文件格式：CommonJS 模块（const 声明 + module.exports）

#### 步骤 9：循环与完成

- 重复步骤 4-8，直到完成指定套数（num）
- 关闭浏览器
- 通过 `process.send` 向父进程发送完成信号 `{ code: '000000' }`

---

## 六、数据模型

### 6.1 采集结果结构

每套试卷采集后生成以下数据结构：

```json
{
  "key": "试卷唯一标识（从 URL 提取）",
  "name": "试卷标题",
  "pageUrl": "答题页 URL",
  "anwserUrl": "答案版 URL",
  "articles": [
    {
      "rank": "1",
      "type": "单选题",
      "materialTitle": "材料标题（可选）",
      "materials": ["材料段落 HTML"],
      "question": ["题干段落 HTML"],
      "options": [
        { "prex": "A", "text": "选项内容 HTML" }
      ],
      "correct": "A",
      "analysis": {
        "analysis": { "name": "解析", "value": ["解析详情"] },
        "keypoint": { "name": "考点", "value": "考点内容" },
        "origin": { "name": "来源", "value": "来源信息" },
        "statistic": { "name": "统计", "value": [{ "key": "正确率", "value": "85%" }] }
      }
    }
  ]
}
```

### 6.2 HTML 提取规则

`getHTML` 方法处理元素的 innerHTML：

- 提取所有 `<img>` 标签
- 将 `<img>` 标签替换为占位符 `|[image]|`
- 清理图片 src 中的 data- 前缀
- 将文本片段和图片标签重新拼接为完整内容

### 6.3 文件存储格式

采集结果以 CommonJS 模块格式保存到本地：

```javascript
const key = 'xxx';
const name = '2024国考行测智能组卷';
const pageUrl = 'https://www.fenbi.com/...';
const anwserUrl = 'https://www.fenbi.com/...';
const articles = [ /* 题目数组 */ ];
module.exports = { key, name, pageUrl, anwserUrl, articles };
```

图片文件以 UUID 命名，保存到对应的 `image/` 子目录下。

---

## 七、接口设计

| 接口 | 方法 | 用途 |
|------|------|------|
| `/chalk/create/examination` | POST | 触发智能组卷采集 |

**POST /chalk/create/examination**

请求体：

```json
{
  "num": 1
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| num | int | N | 采集套数，默认 1 |

响应：

```json
{
  "code": "000000",
  "message": "请求成功",
  "data": null
}
```

**说明：** 该接口为异步触发型，请求返回表示任务已启动。采集完成后子进程通过 `process.send` 通知主进程。后续版本可通过任务 ID 查询采集进度和结果。

---

## 八、配置项

Chalk 配置直接书写在 `config/chalk.ts` 中（参考 `config/env.ts`），不从 `process.env` 获取：

| 配置项 | 说明 | 默认值 |
|---------|------|------|
| `username` | 第三方网站登录账号 | - |
| `password` | 第三方网站登录密码 | - |
| `outputDir` | 采集结果输出目录 | `./examination` |
| `browser` | 浏览器类型 | `chrome` |

---

## 九、WebDriver 辅助方法

`Chalk` 类封装了以下通用页面操作方法：

| 方法 | 说明 |
|------|------|
| `init()` | 实例化 Chrome WebDriver |
| `login()` | 自动登录目标网站 |
| `findElement(xpath, type)` | 查找元素并等待出现（超时 50s） |
| `clickElement(xpath)` | 通过 JS 执行点击 |
| `blinkElement(xpath, value)` | 填写输入框 |
| `deleteElement(xpath, type)` | 隐藏元素（用于清理页面干扰） |
| `getImage(element, dir)` | 滚动到元素并截图，保存为 PNG |
| `getHTML(element)` | 提取元素 innerHTML，分离图片和文本 |
| `setCookies()` | 设置页面 Cookies |
| `sleep(duration)` | 等待指定时间（默认 2000ms） |
| `quit()` | 关闭浏览器 |

---

## 十、安全与合规

### 10.1 凭证安全

第三方网站登录凭证直接书写在 `config/chalk.ts` 中（参考 `config/env.ts`），不从 `process.env` 获取。

### 10.2 访问控制

- Chalk API 仅限管理员角色调用
- 需通过管理员认证中间件校验 JWT
- 采集操作应记录到操作日志

### 10.3 合规说明

- Chalk 仅用于采集公开可访问的题目数据
- 采集的数据需经过管理员审核后方可发布
- 遵守目标网站的 robots.txt 和使用条款

---

## 十一、后续演进

| 阶段 | 计划 |
|------|------|
| V1 当前 | 粉笔网行测智能组卷采集，保存为本地 JS 文件 |
| V1 后续 | 采集结果自动转换为 Importer 统一 JSON Schema，无缝衔接导入流程 |
| V1 后续 | 增加任务状态查询接口，支持异步进度追踪 |
| V2 | 支持多数据源配置（粉笔/华图/中公等） |
| V2 | 支持按科目、年份、地区等维度定向采集 |
| V3 | 结合 AI 自动校验采集数据质量，标记异常题目 |

---

*本文档定义 Chalk 采集器的架构设计。采集后的数据导入流程见 [docs/architecture/05-Importer.md](05-Importer.md)，内容管理见 [docs/architecture/01-Content-Center.md](01-Content-Center.md)。*
