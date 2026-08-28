# QA Report Template

> QA Agent 使用此模板生成测试报告。

## 基本信息

| 字段 | 值 |
|------|-----|
| 测试日期 | {DATE} |
| Spec 文件 | SPEC.md |
| 测试目标 | {URL or description} |
| 测试环境 | {viewport, browser} |
| 测试结论 | {PASS/FAIL} |

---

## 验收标准测试结果

| AC ID | 描述 | 测试方法 | 结果 | 备注 |
|-------|------|---------|------|------|
| AC-01 | {description} | {UI/API/Visual} | PASS/FAIL | {evidence} |
| AC-02 | {description} | {UI/API/Visual} | PASS/FAIL | {evidence} |

---

## 冒烟测试

| 检查项 | 结果 |
|--------|------|
| 页面可正常加载 | PASS/FAIL |
| 无 JS Console 错误 | PASS/FAIL |
| 无布局溢出 | PASS/FAIL |
| 响应时间可接受 | PASS/FAIL |

---

## 测试详情

### AC-01: {title}

**测试步骤**:
1. {step 1}
2. {step 2}
3. {step 3}

**预期结果**: {expected}

**实际结果**: {actual}

**截图**: {path or "N/A"}

**结论**: PASS/FAIL

---

(对每个 AC 重复上述段落)

---

## 回归检查

| 检查项 | 结果 |
|--------|------|
| 核心流程未受影响 | PASS/FAIL |
| 现有功能正常 | PASS/FAIL |

---

## 结构化输出 (用于自动化提取)

```json
{
  "type": "qa",
  "conclusion": "PASS",
  "specFile": "SPEC.md",
  "timestamp": "{ISO timestamp}",
  "criteriaTested": 0,
  "criteriaPassed": 0,
  "criteriaFailed": [],
  "smokeTests": { "passed": 0, "failed": 0 },
  "reviewerAgent": true
}
```
