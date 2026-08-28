# Plan Template

> This template is used by `/write-plan` command.
> A plan.md is created AFTER spec.md is approved.
> Plan describes HOW to implement the spec — tech stack, architecture, decisions.

---

## Plan Document Structure

### Frontmatter (YAML)

```yaml
---
spec: feature-slug        # MUST match the spec.md id
status: draft             # draft | approved
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### Required Sections

#### 1. Technical Approach

Describe the implementation strategy:
- Technology stack selection (framework, language, libraries)
- Architecture pattern (MVC, microservice, monolith, etc.)
- Why this approach was chosen over alternatives
- How it integrates with existing codebase

**Rules:**
- Every tech choice must have a reason (not just "because it's popular")
- If replacing existing tech, explain the migration path
- Reference spec.md requirements by ID (FR-01, FR-02, etc.)

#### 2. Data Model

If this feature involves database changes:

```markdown
## Data Model

### New Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| table_name | purpose | id, field1, field2 |

### Modified Tables
| Table | Change | Fields Affected |
|-------|--------|----------------|
| table_name | ADD column | new_field VARCHAR(255) |

### Indexes
| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| table_name | idx_name | UNIQUE/BTREE | query optimization |

### Migration Notes
- {any data migration needed}
- {backward compatibility concerns}
```

If data model is complex, create a separate `data-model.md` and reference it here.

#### 3. API Contracts

If this feature involves API changes:

```markdown
## API Contracts

### New Endpoints
| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | /api/resource | Create resource | `{...}` | `{...}` |

### Modified Endpoints
| Method | Path | Change | Breaking? |
|--------|------|--------|-----------|
| GET | /api/resource | Add field `xyz` | No |

### Error Responses
| Code | Condition | Body |
|------|-----------|------|
| 400 | Invalid input | `{error: "..."}` |
| 404 | Not found | `{error: "..."}` |
```

If contracts are complex, create separate files under `contracts/` directory.

#### 4. Key Decisions

Record architectural decisions with rationale:

```markdown
## Key Decisions
| # | Decision | Options Considered | Choice | Rationale |
|---|----------|-------------------|--------|-----------|
| 1 | Auth method | JWT, Session, OAuth | JWT | Stateless, works with our SPA |
| 2 | Data store | Redis, SQLite, Postgres | Postgres | ACID compliance needed |
```

**Why this matters:** Future developers need to understand WHY decisions were made, not just WHAT was decided.

#### 5. Risks & Mitigations

```markdown
## Risks & Mitigations
| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 1 | {description} | High/Med/Low | High/Med/Low | {action} |
```

#### 6. Testing Strategy

```markdown
## Testing Strategy
- [ ] Unit Tests: {what to test at unit level}
- [ ] Integration Tests: {what to test at API level}
- [ ] E2E Tests: {critical user journeys to test}
- [ ] Performance Tests: {load/stress if applicable}
- [ ] Security Tests: {if applicable}
```

#### 7. Dependencies

```markdown
## Dependencies
- [ ] New library: {name} v{version} — {purpose}
- [ ] External service: {name} — {purpose}
- [ ] Team dependency: {team/person} — {what they need to provide}
```

---

## Plan Review Checklist

Before approving a plan, verify:
- [ ] Every spec requirement (FR-XX) is addressed in the plan
- [ ] Every tech choice has a rationale
- [ ] Data model changes are backward compatible or have migration plan
- [ ] API contracts match the spec's acceptance criteria
- [ ] Risks are identified with mitigations
- [ ] Testing strategy covers all ACs from the spec
