# PeekFile

`dsh-peekfile-everything` 是面向 DeepSeek Harness Web 的本地文件搜索与预览插件。

计划提供以下能力：

- 通过 EverythingCLI 搜索本地文件；EverythingCLI 是可选依赖。
- 自动识别对话中出现的 Windows、WSL 和工作区本地文件路径。
- 将有效路径转换为可点击链接，并使用统一浮动窗口预览。
- 浏览文件所在目录，支持多标签预览及文件引用。
- 预览文本、代码、Markdown、图片、音视频、PDF、电子书和 Office 文档。

## 当前状态

首个可运行切片已经实现：

- DSH Host/Client 双端插件清单与构建产物。
- EverythingCLI 自动检测、UTF-8 CSV 搜索和最多 100 条结果限制。
- Windows 路径到 WSL 路径的转换。
- 对话本地路径候选验证和可点击链接化。
- 短期预览句柄、目录列表及支持 Range 的原始文件流。
- DSH 标题栏入口、搜索结果表格和统一浮动预览面板。

Office 转换、电子书专用渲染、多标签管理和原生文件引用仍在后续阶段。

## 开发验证

```bash
node --test tests/*.test.js
node build.mjs
```

完整开发方案位于 Obsidian 项目：

```text
X:\Obsidian\Paradise\01-Projects\2026-8-19DSH文件浏览器插件\DSH文件浏览器插件开发方案.md
```

## 项目标识

- 显示名称：`PeekFile`
- 仓库及插件标识：`dsh-peekfile-everything`
- npm 包名：`@kurai/dsh-peekfile-everything`

## 许可证

[MIT](LICENSE)
