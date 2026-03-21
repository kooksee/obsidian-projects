# Projects 贡献指南（中文）

感谢你愿意为 Projects 贡献代码与反馈！

## 你可以怎样贡献

### 1) 提交问题与复现

欢迎提交：

- Bug 报告
- 功能建议
- 交互/文案优化建议
- 性能与兼容性问题（桌面端/移动端）

建议包含：

- Obsidian 版本
- 插件版本
- 操作系统（macOS / Windows / Linux / iOS / Android）
- 最小可复现步骤
- 预期行为与实际行为

### 2) 提交 Pull Request

建议流程：

1. 先开 issue 说明要改什么（避免重复开发）
2. 新建分支开发（例如 `fix/xxx`、`feat/xxx`）
3. 保持单个 PR 聚焦一个问题
4. 本地通过以下检查后再提交：
   - `npm run build`
   - `npm run test`
   - `npm run lint`
   - `npm run svelte-check`

### 3) 参与翻译

翻译相关位置：

- `src/lib/stores/i18n.ts`
- `src/lib/stores/translations/*.json`

新增语言时：

1. 在 `i18n.ts` 的 `resources` 中注册语言代码
2. 在 `translations` 下新增对应语言 JSON

## 标签建议（维护版）

推荐沿用以下分类：

### 类型

- `kind/bug`：缺陷
- `kind/feature`：新功能
- `kind/documentation`：文档改进
- `kind/cleanup`：重构/清理

### 优先级

- `priority/critical`：阻塞使用，需优先处理
- `priority/high`：高优先级
- `priority/normal`：常规优先级

### 领域

- `area/core`
- `area/views`
- `area/datasources`
- `area/integrations`

## 代码风格与提交建议

- 尽量小步提交，避免“超大 PR”
- 避免无关格式化
- 保持对旧配置、旧数据的兼容
- 如果涉及设置结构变化，务必补迁移逻辑与测试

## 社区协作原则

- 尊重他人、就事论事
- 优先提供可复现信息
- 对新手友好，避免攻击性表达

详细行为规范见：[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
