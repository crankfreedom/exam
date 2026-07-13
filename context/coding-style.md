# ExamHub 编码规范

## TypeScript
- 严格模式：strict: true
- 使用 ES2022 目标
- 路径别名 @/ 映射到 ./src/
- 显式类型标注，避免隐式 any
- 禁止使用 any（除极少数 Selenium 兼容场景）

## 命名规范
- 文件/文件夹：kebab-case（question-service.ts）
- 类/接口/组件：PascalCase（QuestionService）
- 变量/函数：camelCase（getQuestionById）
- 常量：UPPER_SNAKE_CASE（MAX_RETRY_COUNT）
- 枚举：PascalCase（QuestionType）

## Vue 规范
- Composition API + script setup
- 组件名多单词，PascalCase
- Props 类型定义完整
- Emit 使用 kebab-case 事件名

## 注释规范
- 复杂逻辑必须注释说明意图
- 不写显而易见的注释
- TODO/FIXME 标记需附带负责人

## CSS 规范
- 使用 CSS Variables 主题系统
- 类名使用 kebab-case
- 禁止行内样式
- 组件作用域样式 scoped

## 错误处理
- API 统一返回 {code, message, data}
- Service 层抛出业务异常
- Controller 层捕获并转换
- 全局错误中间件兜底

## 配置规范
- 配置直接书写在 src/config/ 模块中，参考 config/env.ts 的写法（定义 Interface -> 导出 const 直接赋值）
- 不从 process.env 获取配置值，不使用 dotenv / .env
- 新增配置模块时通过 config/index.ts 聚合导出
- 配置项必须有类型标注，TypeScript 严格模式
