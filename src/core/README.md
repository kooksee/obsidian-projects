# Core（核心层）

`src/core` 用于承载插件运行时核心入口与编排逻辑：

- `plugin/`：插件生命周期、命令注册、设置加载
- `ui/`：Obsidian View 与 Svelte App 的桥接层
- `events/`：文件事件订阅与数据同步入口

本层强调“流程编排”，尽量不放具体业务细节（业务逻辑放在 `src/lib` / `src/ui`）。
