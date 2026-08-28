# 延迟补偿算法详解

## 客户端预测（Client-Side Prediction）

### 原理
客户端立即响应玩家输入，同时发送请求到服务器。服务器校验后，如有差异则纠正。

### 适用场景
- 第一人称射击游戏
- 需要即时反馈的动作游戏

### 关键参数
```
prediction_tolerance = 0.1  // 预测容差，单位秒
max_correction_speed = 10  // 最大纠正速度，单位/秒
```

## 服务器校验（Server Reconciliation）

### 实现步骤
1. 客户端保存输入历史队列
2. 服务器返回确认状态+时间戳
3. 客户端对比预测与实际，必要时回滚重放

### 伪代码示例
```
function applyServerState(serverState, timestamp):
    lastProcessedInput = findInputBefore(timestamp)
    rollbackToState(serverState)
    for input in inputsAfter(lastProcessedInput):
        reapply(input)
```

## 插值与外推

| 技术 | 用途 | 延迟代价 |
|-----|------|---------|
| 插值（Interpolation） | 平滑显示其他玩家位置 | 增加显示延迟 |
| 外推（Extrapolation） | 预测其他玩家未来位置 | 可能预测错误 |

### 混合策略
```
if (entity.velocity < threshold):
    useInterpolation()
else:
    useExtrapolation(maxPredictionTime)
```

## 人为延迟（Input Delay）

### 全局同步点设计
- 所有玩家输入统一延迟N帧执行
- N = max(玩家延迟) / 帧时间

### 动态调整
```
delay_frames = ceil(max_player_latency / frame_duration)
delay_frames = clamp(delay_frames, MIN_DELAY, MAX_DELAY)
```