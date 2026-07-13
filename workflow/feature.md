# ExamHub Feature Workflow

## 流程
Manager -> Architect -> Database -> Backend -> Frontend -> Test -> Docs -> Review -> Commit

## 详细步骤
1. Manager 分析需求，创建 Task
2. Manager 分配 Architect Agent
3. Architect 设计/调整架构方案，定义接口契约
4. Architect 输出给 Manager 审核
5. Manager 分配 Database Agent（如有 Schema 变更）
6. Database Agent 编写 Migration 脚本
7. Manager 分配 Backend Agent
8. Backend Agent 实现 Controller/Service/Repository
9. Backend Agent 编写测试
10. Manager 分配 Frontend Agent（如有前端需求）
11. Frontend Agent 实现页面/组件
12. Manager 分配 Test Agent
13. Test Agent 执行测试，报告缺陷
14. 如有缺陷，退回对应 Agent 修复
15. Manager 分配 Docs Agent 更新文档
16. Manager 执行最终 Review（逐项检查 Checklist）
17. Review 通过后创建 Commit
18. Manager 报告完成
