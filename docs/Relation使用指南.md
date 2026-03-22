# Relation 使用指南（多对一 / 多对多）

本指南说明如何在 Projects 插件中使用 Relation 字段实现“多维表关联”体验，同时保持 Obsidian 原生数据格式。

## 设计目标

- 使用 Obsidian frontmatter 存储关系数据（可迁移、可读）
- 不引入额外关系表
- 兼容单值关系（多对一）与多值关系（多对多）
- 支持 Table 视图的编辑、过滤、排序与反向关系查看

## 数据格式

Relation 统一基于 `[[wikilink]]`。

### 多对一（Many-to-One）

例如任务关联一个负责人：

```yaml
owner: "[[People/Alice]]"
```

### 多对多（Many-to-Many）

例如任务关联多个评审人：

```yaml
reviewers:
  - "[[People/Alice]]"
  - "[[People/Bob]]"
```

## 目前已支持的行为

### 1) Table 编辑规范化

- 单值字段：输入 `People/Alice` 或 `[[People/Alice]]`，保存后会统一为 `[[People/Alice]]`
- 多值字段：列表项会被统一为 `[[...]]` 数组，自动去重和清理空值

### 2) 过滤（Relation-aware）

- 单值字段可用：`is` / `is-not` / `contains` / `not-contains`
- 多值字段可用：`has-any-of` / `has-all-of` / `has-none-of` / `has-keyword`
- 支持裸路径与 wikilink 混用，例如可直接输入 `People/Alice`

### 3) 排序（Relation-aware）

- 单值 relation 按解析后的目标 path 排序（不受 alias 干扰）
- 多值 relation 按归一化后的列表文本排序

### 4) 反向关联只读视图

在编辑笔记弹窗中，会显示 `Linked from` 区域，列出哪些记录通过 relation 字段引用了当前记录。

- 点击条目可打开来源记录
- 当前为只读展示，不会自动双向写回

## 配置建议

推荐将 relation 字段的 `typeConfig` 设为：

```json
{
  "relation": true,
  "relationConfig": {
    "multiple": false,
    "targetProjectId": "optional-project-id",
    "displayField": "name"
  }
}
```

多对多将 `multiple` 设为 `true`。

> 注意：当前版本核心逻辑已支持 relation 配置语义；若 UI 尚未提供完整配置入口，可先通过前置字段配置或数据约定使用。

## 示例：任务管理

```yaml
---
status: todo
owner: "[[People/Alice]]"
reviewers:
  - "[[People/Bob]]"
  - "[[People/Charlie]]"
---
```

你可以在 Table 中：

- 过滤 `owner is People/Alice`
- 过滤 `reviewers has-any-of ["People/Bob"]`
- 按 `owner` 排序
- 打开 `People/Alice` 记录查看 `Linked from`

## 已知限制

- 当前不自动双向写入（避免循环更新与冲突）
- `Linked from` 当前主要在编辑弹窗展示
- relation 配置项的可视化管理入口可继续增强

## 下一步建议

- 增加 relation 配置 UI（字段设置页）
- 在卡片/详情组件中展示反向关联
- 支持批量修复历史纯文本关系值为 `[[...]]`
