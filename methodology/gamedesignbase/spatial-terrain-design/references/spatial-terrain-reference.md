# 空间与地形设计参考

## 变量定义
- `space_type` (Enum): 空间类型：discrete_rectangular/discrete_hex/discrete_irregular/continuous
- `cpu_power` (Boolean): 是否有足够的CPU计算能力
- `realism_requirement` (Enum): 现实模拟需求：high/medium/low
- `terrain_type` (Enum): 地形类型：natural_curved/urban_linear/mixed
- `movement_focus` (Enum): 移动焦点：physical_distance/relationship_adjacency
- `elevation_level` (Numeric): 单位所在的海拔高度等级，影响战斗优势
- `terrain_type` (Enum): 地形类型（道路、农田、树林、山丘等），决定移动速度修正
- `cover_type` (Enum): 掩护类型（自然、人造、装饰），决定防御加成和隐藏能力
- `unit_type` (Enum): 单位类型（如步兵、车辆），影响对不同地形的通过性
- `交互模式` (Enum): 化身模式、多处存在、空中视角等
- `视角类型` (Enum): 第一人称、第三人称跟随、俯视、等角等
- `移动输入方式` (Enum): 直接控制、间接控制、指令式等

## 约束条件
- CPU功率限制会影响连续空间的实现
- 游戏类型（抽象策略vs现实模拟）决定空间选择
- 不适用于完全均匀的公海环境（除非添加岛屿等特征）
- 不适用于纯菜单驱动、无空间维度的游戏

## 相关游戏
- 国际象棋
- 星际争霸
- 征服世界(Risk)
- 划船比赛