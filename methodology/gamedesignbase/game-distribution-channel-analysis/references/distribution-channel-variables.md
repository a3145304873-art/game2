# 发行渠道分析变量定义

## 网络销售模式变量

| 变量名 | 类型 | 描述 |
|-------|------|------|
| platform_fee_rate | Percentage | 平台收取的费用比例，通常约为30% |
| developer_share | Percentage | 开发者获得的利润比例，通常约为70% |
| typical_price_range | Currency Range | App市场游戏常见售价，通常在1-5美元 |

## 跨渠道观察变量

| 变量名 | 类型 | 描述 |
|-------|------|------|
| retail_channel | Enum | 渠道类型：实体零售(physical)或在线商城(online) |
| game_category | String | 观察到的游戏类别名称 |
| game_count | Integer | 该类别下的游戏数量 |
| platform_type | String | 游戏运行的平台类型 |
| shelf_space_percentage | Float | 实体渠道中该类别的货架空间占比（估算） |

## 对比分析模板

### 类别分布对比表

| 类别名称 | 实体店数量 | 在线商城数量 | 差异比率 | 备注 |
|---------|-----------|-------------|---------|------|
| 动作游戏 | XX | XXX | X.XX | |
| 冒险游戏 | XX | XXX | X.XX | |
| 独立游戏 | 0 | XXX | N/A | 仅在线 |
| ... | ... | ... | ... | |

### 平台分布对比表

| 平台类型 | 实体渠道占比 | 数字渠道占比 | 主要差异 |
|---------|-------------|-------------|---------|
| PlayStation | XX% | XX% | |
| Xbox | XX% | XX% | |
| Nintendo | XX% | XX% | |
| PC | XX% | XX% | 数字渠道更多独立游戏 |
| 移动设备 | 0% | XX% | 仅数字渠道 |