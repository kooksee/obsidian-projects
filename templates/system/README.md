# 内置模板（system）

这是 Obsidian Projects 的内置模板目录。

## 文件列表

- `issue-template.md`
- `task-template.md`
- `project-template.md`
- `team-template.md`
- `product-template.md`
- `member-template.md`
- `feature-unit-template.md`

## 模板变量

| 变量   | 语法                           | 说明                                 |
| ------ | ------------------------------ | ------------------------------------ |
| 标题   | `{{title}}`                    | 创建笔记时输入的名称                 |
| 日期   | `{{date}}` / `{{date:FORMAT}}` | 默认 YYYY-MM-DD，支持 moment.js 格式 |
| 时间   | `{{time}}` / `{{time:FORMAT}}` | 默认 HH:mm                           |
| 项目名 | `{{project}}`                  | 当前项目名称                         |
| UUID   | `{{uuid}}`                     | 生成唯一标识符                       |

详细用法和格式列表见 [默认模板 README](../default/README.md)。

## 使用方式

- 在插件设置中配置：
  - Template root directory（默认 `templates/system`）
  - Default template type
  - 每个模板类型对应的文件名
- 支持通过 Custom types 添加自定义模板类型
- 创建笔记时，插件会按类型映射自动选择模板。
