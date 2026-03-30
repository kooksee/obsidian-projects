# Default note templates

This directory contains starter templates for common project workflows:

- `issue-template.md`
- `task-template.md`
- `project-template.md`
- `team-template.md`
- `product-template.md`

These templates support Projects template variables:

- `{{title}}`
- `{{date:YYYY-MM-DD}}`
- `{{time:HH:mm}}`

## How to use in Obsidian Projects

1. Copy these files into your Obsidian vault (for example, `Templates/Projects/`).
2. In your project configuration, add those file paths to **Templates**.
3. Create a note from the project and choose one of the templates.

## Recommended field conventions (Linear-style)

Use consistent values across notes so filtering/grouping works reliably.

### `state`

- `backlog`: not started, waiting for prioritization
- `todo`: planned for execution
- `in_progress`: currently being worked on
- `in_review`: implementation done, waiting for review/QA
- `done`: completed
- `canceled`: intentionally dropped

### `priority`

- `P0`: critical, immediate action
- `P1`: high
- `P2`: medium (default)
- `P3`: low
- `P4`: very low / nice-to-have

### `estimate`

Recommended points: `1, 2, 3, 5, 8`.

### `cycle`

Use a stable naming format, for example:

- `2026-W14`
- `2026-Q2-C1`

### dependency fields

- `blocking`: IDs/links this note is blocking
- `blocked_by`: IDs/links that block this note

## Suggested lifecycle

`backlog -> todo -> in_progress -> in_review -> done`

For issues/tasks that should stop, set `state: canceled`.
