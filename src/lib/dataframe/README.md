# Dataframe（数据帧）

该模块定义了 Projects 的核心数据结构：_data frame_。

一个 data frame 包含两部分：

- _data records_（记录，可理解为表格的行）
- _data fields_（字段，可理解为表格的列）

下面示例展示了 4 条记录、3 个字段（`due_date`、`published`、`hours_spent`）。

| `id`                 | `due_date` | `published` | `hours_spent` |
| -------------------- | ---------- | ----------- | ------------- |
| Blog/First draft.md  | 2025-01-01 | `true`      | 7             |
| Blog/Second draft.md | 2025-01-08 | `true`      | 4             |
| Blog/Third draft.md  | 2025-01-15 | `false`     | 2             |
| Blog/Fourth draft.md | 2025-01-22 | `false`     | 1             |
