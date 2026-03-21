<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/marcusolsson/obsidian-projects/main/images/dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/marcusolsson/obsidian-projects/main/images/light.svg">
  <img alt="Projects logo" src="https://raw.githubusercontent.com/marcusolsson/obsidian-projects/main/images/light.svg">
</picture>

[![Build Obsidian plugin](https://github.com/marcusolsson/obsidian-projects/actions/workflows/ci.yml/badge.svg)](https://github.com/marcusolsson/obsidian-projects/actions/workflows/ci.yml)
[![Release Obsidian plugin](https://github.com/marcusolsson/obsidian-projects/actions/workflows/release.yml/badge.svg)](https://github.com/marcusolsson/obsidian-projects/actions/workflows/release.yml)
![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22obsidian-projects%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)

# Projects（Obsidian 项目管理插件）

Projects 是一个用于 Obsidian 的项目管理插件，支持以“纯文本笔记”为中心进行任务与项目管理。

核心能力：

- 从文件夹、标签、Dataview 查询创建项目
- 以四种视图查看项目：表格（Table）、看板（Board）、日历（Calendar）、画廊（Gallery）
- 为项目配置新建笔记模板

## 当前维护状态

> 原作者已在 2025 年停止维护，上游项目已归档。
>
> 如果你希望继续使用，可通过 BRAT 安装或使用社区维护分支。

## 中文文档入口

- [维护指南](./docs/维护指南.md)
- [技术栈与优化建议](./docs/技术栈与优化建议.md)
- [接手、运行、调试、发布指南](./docs/接手运行调试发布.md)
- [项目结构重组说明](./docs/项目结构重组说明.md)
- [项目管理功能规划与优化清单](./docs/项目管理功能规划与优化清单.md)

## 项目结构（重组后）

- `src/`：插件源码（核心逻辑 + UI）
  - `src/core/`：插件核心编排层（入口、事件、视图桥接）
- `config/build/`：构建配置（esbuild）
- `config/lint/`：Lint 配置（ESLint）
- `config/test/`：测试配置（Jest）
- `scripts/release/`：版本与发布脚本
- `docs/`：维护文档与实践指南

## 安装方式

### 社区插件市场（若可见）

1. 打开 Obsidian 设置
2. 进入「第三方插件」→「浏览」
3. 搜索 `Projects`
4. 安装并启用

### BRAT（推荐兼容方式）

如插件不在官方列表，可使用 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 从仓库安装。

## 开发者快速开始

1. 安装依赖：`pnpm install`
2. 开发构建（watch）：`pnpm dev`
3. 生产构建：`pnpm build`
4. 测试：`pnpm test`
5. Lint：`pnpm lint`
6. Svelte 检查：`pnpm svelte-check`

构建产物：

- `build/main.js`
- `build/manifest.json`
- `build/styles.css`

## 设计原则（沿用）

- **不污染数据（Leave no trace）**：尽量不引入插件专属、难迁移的数据结构。
- **保持原生体验（Keep it native）**：尽量贴近 Obsidian 原生行为与外观。
- **稳定优先（Stability over features）**：先修 bug 与可用性，再加新功能。

## 贡献方式

请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)（中文），按约定提交 issue / PR。

## 许可证

本项目采用 [Apache License 2.0](./LICENSE)。
