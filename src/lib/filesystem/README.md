# File system（文件系统）

在 Obsidian 生态中写单元测试会比较麻烦，因为很多能力只能在应用内使用。

`filesystem` 模块通过抽象 Obsidian Vault，让测试可以使用内存中的笔记表示，从而提升可测性。
