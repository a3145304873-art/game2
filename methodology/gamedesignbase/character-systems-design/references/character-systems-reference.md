# 角色系统设计参考

## 变量定义
- `change_frequency` (Enum): 属性变化频率：frequent（频繁）或 infrequent（不频繁）
- `value_variance` (Enum): 数值变化幅度：large（大）或 small/none（小/无）
- `status_attributes` (Array): 状态属性集合，如HP、饥饿值等
- `characterization_attributes` (Array): 特征属性集合，如体质、性格特质等
- `主导方法论` (Categorical): Art-driven 或 Story-driven
- `核心体验目标` (Categorical): 视觉美学体验 或 叙事沉浸体验
- `决策冲突解决机制` (Process): 当美术与叙事冲突时的裁决流程

## 约束条件
- 不适用于无角色抽象的游戏类型
- 精神/心理疾病设定可能打破特征属性的稳定性
- 资源限制通常不允许双轨并行
- 方法论冲突可能导致设计不一致

## 源示例
- D&D生命值与体质
- 模拟人生需求与性格