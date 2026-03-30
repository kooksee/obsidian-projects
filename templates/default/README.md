# 默认笔记模板

此目录包含常见项目场景的中文模板：

- `issue-template.md`
- `task-template.md`
- `project-template.md`
- `team-template.md`
- `product-template.md`
- `member-template.md`

## 模板约定

- 模板内容均为中文
- 模板包含 frontmatter 属性块（`---` 包裹）
- 属性键名保持英文（不做中文翻译）
- 支持以下变量：
	- `{{title}}`
	- `{{date:YYYY-MM-DD}}`
	- `{{time:HH:mm}}`

## 在 Obsidian Projects 中使用

1. 运行 `npm run install:obsidian`，模板会自动同步到 vault 的模板目录。
2. 在项目配置的 **Templates** 中添加模板文件路径。
3. 在项目中创建笔记并选择对应模板（单模板项目会自动套用）。
