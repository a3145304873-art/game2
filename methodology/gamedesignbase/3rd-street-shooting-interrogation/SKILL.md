---
name: 3rd-street-shooting-interrogation
description: 调查 3rd Street 枪击案时对嫌疑人进行标准化审讯。用于获取嫌疑人不在场证明、核实酒吧行踪（Foley's Bar 9 PM-Midnight）以及收集关于蓝色跑车的目击证词。当嫌疑人已被控制且准备接受询问，需要突破其心理防线获取关键线索时触发。
---

# 3rd Street 枪击案嫌疑人审讯流程

## 适用场景
- 调查 3rd Street 枪击案（受害者为 Keane）
- 嫌疑人已被控制并准备接受询问
- 需要获取不在场证明和目击证据
- 注意：若嫌疑人要求律师，审讯可能中断

## 核心目标
1. 确认嫌疑人声称的不在场证明（Foley's Bar，9 PM - Midnight）
2. 获取关于蓝色跑车的目击线索
3. 避免触发嫌疑人要求律师的防御机制

## 审讯阶段与策略

### 阶段一：对话开始（建立基调）
根据嫌疑人心理状态选择审讯语气：

**可选语气及对应回应：**
- **礼貌 (Polite)**："We need your help to solve a crime..."
  - 嫌疑人回应："Yeah, I was coming home from a bar."
  - *效果：合作度较高，适合温和开场*

- **中立 (Neutral)**："What were you doing on 3rd Street last night?"
  - 嫌疑人回应："Getting drunk, what's it to you?"
  - *效果：保持对话开放性*

- **直接 (Direct)**："We think you were involved in the shooting..."
  - 嫌疑人回应："Hey, no way! Violence is not my thing, man."
  - *效果：直接否认涉案，可继续施压*

- **指责 (Accusatory)**："Keane got shot last night. We know you did it..."
  - 嫌疑人回应："That's garbage, and I'm saying nothing."
  - *效果：触发防御，可能导向僵局*

### 阶段二：索要不在场证明 (DEMAND AN ALIBI)
要求嫌疑人提供具体不在场证明：

**策略选择：**
- **讽刺 (Sarcastic)**："Oh, yeah, you're a model citizen..."
  - 回应："I was in a bar. OK?"（初步承认）
  
- **指责 (Accusatory)**："That's not what your police record says..."
  - 回应："Look, I was in a bar. 9 to midnight."（提供具体时间）

### 阶段三：询问酒吧名称 (NAME OF BAR)
核实具体地点：

**提问方式：**
- **礼貌**："That's good, we'll need the name of the bar."
  - 回应："I was in Foley's from 9 until midnight."
  
- **中立**："Yeah? What bar were you in?"
  - 回应："Foley's. I'm there every night."
  
- **直接**："You better not be lying..."
  - 回应："I ain't lying. It was Foley's Bar."
  
- **指责**："You weren't in any bar, you were in the alley..."
  - 回应："No, I wasn't, and you've got nothing."（对抗升级）

### 阶段四：确认酒吧逗留时间 (TIME OF BAR VISIT)
**关键风险点**：不当语气可能触发律师要求

**安全选项：**
- **礼貌**："Can you tell us what time you were there, please?"
  - 回应："Got there around 9, left around midnight."
  
- **中立**："When did you get there, and how long did you stay?"
  - 回应："Got there around 9, left around midnight."

**危险选项（避免使用）：**
- **直接**："You better hope Foley backs you up..."
  - 回应："Forget it. I want a lawyer."（审讯中断）

### 阶段五：询问目击证据 (ASK ABOUT EVIDENCE)
获取关键案件线索：

**必问问题及预期回应：**
1. "Did you hear any shots around that time?"
   - 回应："No, no shots. I'd remember shots."
   
2. "We're trying to trace a tall man in jogging clothes..."
   - 回应："Not that I remember."
   
3. "When you came out, did you see a blue car go by?"
   - 回应："Yeah... going real fast! A sports car."（关键线索）
   
4. "That's all we want to know for now."
   - 回应："Good, 'cause I got places to be, you know?"

## 关键变量跟踪
在审讯过程中记录以下信息：

| 变量 | 类型 | 预期值 | 验证状态 |
|------|------|--------|----------|
| `Bar_Name` | String | Foley's | 需与 Foley 核实 |
| `Time_Frame` | TimeRange | 9 PM - Midnight | 需交叉验证 |
| `Tone` | Enum | Polite/Neutral/Direct/Accusatory/Sarcastic | 影响合作度 |
| `Lawyer_Requested` | Boolean | false | 若为 true，审讯终止 |

## 成功标准
- [ ] 确认嫌疑人声称在 Foley's Bar
- [ ] 确认时间段为 9 PM 至 Midnight
- [ ] 获取关于蓝色跑车（blue sports car）的目击证词
- [ ] 未触发嫌疑人要求律师

## 风险管控
1. **律师介入风险**：避免在阶段四使用指责或直接威胁语气
2. **虚假陈述识别**：若嫌疑人否认在酒吧（"You weren't in any bar"），需准备 alley 现场的反驳证据
3. **信息完整性**：确保询问蓝色跑车问题，这是连接其他线索的关键