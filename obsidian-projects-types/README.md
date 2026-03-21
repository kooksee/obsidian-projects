# Custom View API（中文）

> 注意：该 API 仍属于实验性质，后续可能出现不兼容变更。

通过 `obsidian-projects-types`，你可以为 Projects 插件注册自定义视图。

## 安装依赖

```bash
npm install --save-dev obsidian-projects-types@latest
```

或

```bash
yarn add --dev obsidian-projects-types@latest
```

## 注册自定义视图

步骤：

1. 创建一个继承 `ProjectView` 的类。
2. 在你的 Obsidian 插件中实现 `onRegisterProjectView`，返回该视图实例。

示例：

```ts
import { Plugin } from "obsidian";
import {
  DataQueryResult,
  ProjectView,
  ProjectViewProps,
} from "obsidian-projects-types";

class MySampleView extends ProjectView {
  dataEl?: HTMLElement;

  getViewType(): string {
    return "my-sample-view";
  }

  getDisplayName(): string {
    return "示例视图";
  }

  getIcon(): string {
    return "apple";
  }

  // 每次数据更新都会调用。你应当在这里替换旧数据渲染。
  async onData({ data }: DataQueryResult) {
    if (this.dataEl) {
      this.dataEl.empty();
      this.dataEl.createDiv({ text: JSON.stringify(data.fields) });
      this.dataEl.createDiv({ text: JSON.stringify(data.records) });
    }
  }

  // 用户激活该视图时调用。
  async onOpen({ contentEl, config, saveConfig, readonly }: ProjectViewProps) {
    console.log("Opening ", this.getDisplayName());

    contentEl.createEl("h1", { text: "My Sample View" });

    this.dataEl = contentEl.createEl("div");
  }

  // 用户离开或移除视图时调用。
  async onClose() {
    console.log("Closing ", this.getDisplayName());
  }
}

export default class MyPlugin extends Plugin {
  // Projects 会调用该方法注册视图（可能调用多次）。
  onRegisterProjectView = () => new MySampleView();
}
```
