# ExamHub Refactor Workflow

## 流程
Manager -> Architect -> Backend/Frontend -> Test -> Review -> Commit

## 详细步骤
1. Manager 分析重构需求，确定范围
2. Manager 分配 Architect Agent
3. Architect 评估影响范围，制定重构方案
4. Architect 输出给 Manager 审核
5. Manager 分配 Backend/Frontend Agent 执行重构
6. Agent 确保已有测试通过
7. Agent 编写新测试覆盖变更
8. Manager 分配 Test Agent 执行回归测试
9. Manager 执行 Review
10. Review 通过后创建 Commit
11. Manager 报告完成
