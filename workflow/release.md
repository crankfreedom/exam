# ExamHub Release Workflow

## 流程
Manager -> Test -> Docs -> DevOps -> Review -> Commit

## 详细步骤
1. Manager 创建 Release Task，确定版本号
2. Manager 分配 Test Agent 执行全量测试
3. Test Agent 输出测试报告
4. Manager 分配 Docs Agent 更新 CHANGELOG 和版本号
5. Manager 分配 DevOps Agent 准备部署配置
6. DevOps Agent 确认部署脚本和环境变量
7. Manager 执行最终 Review
8. Review 通过后创建 Release Commit
9. Manager 合并到 main 分支
10. Manager 触发部署
