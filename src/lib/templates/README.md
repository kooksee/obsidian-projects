# Templates（模板）

该模块实现模板插值（interpolate）相关逻辑。

## 核心函数

`interpolateTemplate(template, data)` — 将 `{{变量名}}` 或 `{{变量名:参数}}` 替换为实际值。

## 注册的变量

| 变量      | 注册位置                                                   | 说明                     |
| --------- | ---------------------------------------------------------- | ------------------------ |
| `title`   | `dataApi.createNote`                                       | 笔记文件名（不含扩展名） |
| `date`    | `dataApi.createNote` / `createNoteModal` / `CreateProject` | moment.js 格式化日期     |
| `time`    | `dataApi.createNote` / `createNoteModal` / `CreateProject` | moment.js 格式化时间     |
| `project` | `dataApi.createNote` / `createNoteModal` / `CreateProject` | 当前项目名称             |
| `uuid`    | `dataApi.createNote`                                       | UUID v4 唯一标识符       |

## 语法规则

- `{{name}}` — 无参数调用
- `{{name:arg}}` — 带参数调用（冒号后的所有内容作为参数）
- `{{ name }}` — 两侧空格会被自动忽略
- 未识别的变量名会被替换为空字符串
