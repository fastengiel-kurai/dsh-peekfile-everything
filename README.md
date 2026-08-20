# PeekFile

`dsh-peekfile-everything` 是面向 DeepSeek Harness Web 的本地文件搜索与预览插件。

代码和脚本文件仅以带格式、带行号的只读文本方式预览。PeekFile 不检测或运行代码项目，不提供终端、开发服务器、localhost 调试或运行日志功能。

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
- 浏览窗跟随系统浅色/深色配色；默认仅显示文件列表，打开文件后切换为全宽预览。
- 文件列表使用断开的 2px 暖色类型标识边框，按文件夹、文档、表格、演示、媒体、代码等类别区分；记录之间以随明暗主题变化的对比色虚线分隔。
- OfficeCLI HTML 优先、LibreOffice PDF 后备的可选 Office Provider，并带转换缓存和并发锁。
- EPUB 本地解包、首章解析和同句柄相对资源托管；MOBI/AZW 在存在 `ebook-convert` 时自动转换。
- 预览刷新和原文件下载。
- DSH 原生 `file` 引用 codec、文件引用胶囊、全文行号范围和目录纯文本引用。
- 本地文件预览默认不限制大小（流式读取与 Range），可在设置中配置预览上限。
- 对话框拖入非图片文件后保存到工作区 `.dsh-drops/`，默认单文件上限 10 MB，可在设置中修改；纯图片仍交给 DSH 原生附件流程。
- “设置 → Web UI 插件”中的搜索、路径链接、代码块识别、拖入文件和结果上限开关。
- Everything 结果本地分页及原生 `@` Everything 搜索来源。
- 从搜索结果进入目录后，可一键返回本次搜索列表并保留原页状态。
- 文本/代码行号、Markdown 和 CSV 专用渲染，并支持行号、PDF 页码和媒体时间片段定位。
- Document Picture-in-Picture → Popup → 页面内 Overlay 三级预览降级。
- 预览选区按行号添加到对话，以及系统默认程序打开。

字幕、图片标注和 OCR 等文件预览增强能力仍在后续阶段。

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
