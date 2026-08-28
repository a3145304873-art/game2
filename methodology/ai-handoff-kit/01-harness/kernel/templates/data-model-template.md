# Data Model Template

> This template is used by `/write-plan` when the feature involves database changes.
> Created as a separate file only when data model is complex.
> For simple changes, include directly in plan.md.

---

## Data Model Document Structure

### Frontmatter (YAML)

```yaml
---
spec: feature-slug
plan: draft | approved
created: YYYY-MM-DD
---
```

### Required Sections

#### 1. Entity Relationship

Describe the relationships between entities:
```markdown
## Entity Relationship

EntityA (1) ──< (N) EntityB
EntityB (N) >── (1) EntityC
```

#### 2. Table Definitions

For each table:

```markdown
## Table: {table_name}

**Purpose:** {what this table stores}

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT | Primary key |
| name | VARCHAR(255) | NOT NULL | Display name |
| status | ENUM('active','inactive') | DEFAULT 'active' | Record status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last modification |

### Indexes
| Name | Columns | Type | Purpose |
|------|---------|------|---------|
| idx_name | column1, column2 | UNIQUE | Prevent duplicates |

### Foreign Keys
| Column | References | On Delete | On Update |
|--------|-----------|-----------|-----------|
| parent_id | other_table(id) | CASCADE | CASCADE |
```

#### 3. Migration Plan

```markdown
## Migration Plan

### Forward Migration (up)
1. {Step 1: what to create/alter}
2. {Step 2: data migration if needed}
3. {Step 3: index creation}

### Rollback Migration (down)
1. {Step 1: drop indexes}
2. {Step 2: revert data changes}
3. {Step 3: drop/revert tables}

### Data Migration (if applicable)
- Source: {table/field}
- Target: {table/field}
- Transform: {any data transformation logic}
- Estimated rows: {count}
- Downtime required: {yes/no, duration}

### Backward Compatibility
- {Can old code read new schema?}
- {Can new code read old schema?}
- {Rollback strategy if migration fails}
```

#### 4. Query Patterns

Document expected query patterns for index optimization:

```markdown
## Query Patterns

| Query | Frequency | Key Columns | Suggested Index |
|-------|-----------|-------------|-----------------|
| SELECT by user_id + status | High | user_id, status | Composite index |
| JOIN with orders | Medium | id | FK index |
```
