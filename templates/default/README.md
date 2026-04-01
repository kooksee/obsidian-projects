# 默认笔记模板

此目录包含常见项目场景的中文模板：

- `issue-template.md`
- `task-template.md`
- `project-template.md`
- `team-template.md`
- `product-template.md`
- `member-template.md`
- `feature-unit-template.md`

## 模板约定

- 模板内容均为中文
- 模板包含 frontmatter 属性块（`---` 包裹）
- 属性键名保持英文（不做中文翻译）
- 支持模板变量（详见下方）

## 模板变量

在模板 `.md` 文件中，用 `{{ }}` 包裹变量名，创建笔记时自动替换。

| 变量         | 语法                  | 结果示例            | 说明                                                                      |
| ------------ | --------------------- | ------------------- | ------------------------------------------------------------------------- |
| 标题         | `{{title}}`           | `我的任务`          | 创建笔记时输入的名称                                                      |
| 日期         | `{{date}}`            | `2026-04-01`        | 默认格式 YYYY-MM-DD                                                       |
| 日期(自定义) | `{{date:YYYY/MM/DD}}` | `2026/04/01`        | 冒号后跟 [moment.js 格式](https://momentjs.com/docs/#/displaying/format/) |
| 时间         | `{{time}}`            | `14:30`             | 默认格式 HH:mm                                                            |
| 时间(自定义) | `{{time:HH:mm:ss}}`   | `14:30:05`          | 同上                                                                      |
| 项目名       | `{{project}}`         | `Sprint 2026-Q2`    | 当前所在项目的名称                                                        |
| UUID         | `{{uuid}}`            | `a1b2c3d4-e5f6-...` | 每次生成唯一 ID                                                           |

### 使用位置

- **frontmatter 中**：自动填入字段值
- **正文中**：同样可被替换
- **项目 defaultName 中**：如 `{{date:MMDD}} {{project}}` → 笔记名变为 `0401 Sprint Q2`

### 日期/时间格式参考

| 格式               | 输出示例           | 说明         |
| ------------------ | ------------------ | ------------ |
| `YYYY-MM-DD`       | `2026-04-01`       | 年-月-日     |
| `YYYY-MM-DDTHH:mm` | `2026-04-01T14:30` | ISO 日期时间 |
| `YYYY年MM月DD日`   | `2026年04月01日`   | 中文日期     |
| `MMDD`             | `0401`             | 短日期       |
| `HH:mm`            | `14:30`            | 时:分        |
| `HH:mm:ss`         | `14:30:05`         | 时:分:秒     |
| `ddd`              | `Tue`              | 星期缩写     |

完整格式列表见 [moment.js 文档](https://momentjs.com/docs/#/displaying/format/)。

### 完整示例

```yaml
---
title: "{{title}}"
id: "{{uuid}}"
type: task
project: "{{project}}"
created: "{{date:YYYY-MM-DDTHH:mm}}"
tags:
  - task
---

# {{title}}

创建于 {{date:YYYY年MM月DD日}} {{time:HH:mm}}，所属项目：{{project}}
```

## 自定义模板类型

除了 7 种内置类型（issue / task / project / team / product / member / feature_unit），
你可以在插件设置中添加自定义模板类型：

1. 打开 Settings → Templates → Custom types
2. 填入 key（如 `epic`）和 label（如 `Epic`）
3. 设置对应的模板文件名（如 `epic-template.md`）
4. 在模板根目录中创建该文件

## 字段可选值（枚举）

模板中 `state: todo` 这类字段的取值不是模板变量控制的。
可选值通过以下方式定义：

- **项目蓝图**（创建项目时选择预设方案）
- **项目字段配置**（Settings → Field Config → options）

例如 `status` 字段的可选值 `["todo", "doing", "done"]` 在项目配置中设定，
模板只负责设定新笔记的**初始默认值**。

## 在 Obsidian Projects 中使用

1. 运行 `npm run install:obsidian`，模板会自动同步到 vault 的模板目录。
2. 在插件设置的 **Templates** 中配置根目录、默认类型、各类型文件映射。
3. 在项目中创建笔记并选择对应模板（单模板项目会自动套用）。
