# ExamHub Git 工作流程

## 分支模型
- main：生产分支，永远可部署
- develop：开发主分支
- feature/{name}：功能分支
- bugfix/{name}：缺陷修复分支
- refactor/{name}：重构分支
- release/{version}：发布分支

## 开发流程
1. 从 main 创建 feature/bugfix 分支
2. 在分支上开发
3. 提交到分支
4. 创建 Pull Request 到 main
5. Review 通过后合并
6. 删除分支

## 提交规范
格式：<type>(<scope>): <description>
类型：feat/fix/docs/style/refactor/test/chore
示例：feat(chalk): add smart exam paper creation
      fix(auth): fix JWT token refresh
      docs(api): update REST API documentation

## 合并规范
- 使用 squash merge 合并功能分支
- 保留合并提交（--no-ff）
- PR 必须通过 Review
- PR 描述需包含变更摘要

## 禁止事项
- 直接往 main 推送（除非紧急修复）
- 在 main 上开发
- 合并未经 Review 的代码
- 包含调试代码的提交
