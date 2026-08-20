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
- 上级目录点击、目录下钻、安全根边界和面包屑导航。
- 可拖动、可缩放的多标签预览，中键或关闭按钮关闭标签。
- OfficeCLI HTML 优先、LibreOffice PDF 后备的可选 Office Provider，并带转换缓存和并发锁。
- EPUB 本地解包、首章解析和同句柄相对资源托管；MOBI/AZW 在存在 `ebook-convert` 时自动转换。
- 预览刷新和原文件下载。
- DSH 原生 `file` 引用 codec、文件引用胶囊、全文行号范围和目录纯文本引用。
- 对话框拖入非图片文件后保存到工作区 `.dsh-drops/`，单文件上限 64 MB；纯图片仍交给 DSH 原生附件流程。
- “设置 → Web UI 插件”中的搜索、路径链接、代码块识别、拖入文件和结果上限开关。

选区行号、项目运行、网页标记和字幕等高级能力仍在后续阶段。

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
