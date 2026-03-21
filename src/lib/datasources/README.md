# Data sources（数据源）

该模块包含 Projects 的各类 _data source_（数据源），用于抽象“如何从笔记中提取数据”的逻辑。

数据源负责把查询结果转换为 _data frame_，也就是 Projects 的统一数据格式。

- [dataview](./dataview)
- [folder](./folder)
- [tag](./tag)

其中 `frontmatter` 数据源是一个中间抽象，供 `folder`、`tag` 这类依赖 frontmatter 字段的场景复用。
