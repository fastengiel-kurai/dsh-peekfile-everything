# PeekFile

`dsh-peekfile-everything` 是面向 [DeepSeek Harness（DSH）](https://github.com/omdsh-dev/deepseek-harness) 的本地文件搜索、目录浏览与多格式预览插件。

PeekFile 可以统一搜索当前工作目录、WSL 文件系统和 Windows Everything 索引；也会识别对话中出现的本地路径，将其转换为可点击的预览入口。Everything CLI、Better Sidebar 和文档转换工具均为可选依赖，没有安装 Everything 时仍可搜索工作目录与 WSL，并预览对话中的本地文件路径。

> 当前版本主要在 Windows 11 + WSL2 Ubuntu 24.04 + DSH Web 环境开发和验证。macOS 已保留接口，但画框截图入口暂不显示。

## 主要功能

### 文件搜索与浏览

- 三个独立搜索来源：当前工作目录、WSL 内部文件、Windows Everything。
- 搜索范围支持多选，默认全选；三类结果按“工作目录 → WSL → Everything”排序并使用不同文字颜色。
- 每个来源独立分页，单页数量可配置；已获取的结果只缓存在页面内存中，不写入磁盘。
- 在原查询后追加 `+关键词`，可继续筛选当前缓存，例如 `动画片 +合集`。
- 保存最近 10 条去重搜索历史，点击历史记录即可重新搜索。
- 点击目录在原位置下钻，支持返回搜索结果、上级目录和当前路径显示。
- 文件名、类型、上级目录、来源和命中关键词以表格形式展示。

### 对话与本地路径

- 自动识别 Windows 路径、WSL/POSIX 路径和工作区路径，并转换为可点击链接。
- 支持从 PeekFile 将文件路径、文本全文、文本选区、截图或 OCR 结果加入当前会话。
- 支持 DSH 原生文件引用胶囊和 `@路径:起始行-结束行` 引用。
- 非图片文件可拖入输入框并保存到工作区 `.dsh-drops/`；默认单文件上限 10 MB。
- 本地预览默认无大小限制，可在设置中另行设置上限。

### 浮动窗口与 Better Sidebar

- 默认使用可拖动、可缩放、浅色/深色自适应的浮动窗口。
- 多 Tab 预览，支持返回文件列表、中键关闭、刷新、系统打开和另存为。
- 可选将 PeekFile 主界面注册到 Better Sidebar。
- 预览路由可全部交给 PeekFile，或按文件类型选择 PeekFile / Better Sidebar。
- Better Sidebar 只接收当前工作目录内且具有匹配 Viewer 的文件；工作区外文件始终由 PeekFile 预览。

### 文件预览

| 文件类型 | 预览与操作 |
| --- | --- |
| 文本、代码、脚本、Markdown、CSV | 只读行式文本、行号、全文/选区加入会话、复制、另存为 |
| 图片 | 原图预览、插入会话、画框截图、OCR、系统打开 |
| 视频 | MP4/WebM/MOV/M4V 等浏览器播放；MKV/AVI/WMV/RMVB 等可用 FFmpeg 转 MP4；截图和画框截图 |
| PDF | 原始 PDF 预览；文本/混合 PDF 可选字；全图 PDF 支持截图 OCR；AnyDoc 可发送全文 Markdown |
| Word、Excel、PowerPoint | OfficeCLI 转 HTML 后预览和选字；AnyDoc 可发送全文 Markdown |
| EPUB | 连续滚动阅读、目录解析、上一页/下一页、上一章/下一章、当前位置显示 |
| MOBI、AZW、AZW3、FB2 | 通过 Calibre `ebook-convert` 转为 EPUB 后阅读 |
| 压缩包及其他文件 | 不在 PeekFile 内解包预览，可调用系统关联程序打开 |

视频转码结果写入源文件所在目录，文件主名不变、后缀改为 `.mp4`；如果同名 MP4 已存在，PeekFile 不会覆盖它。

## 安装

### 环境要求

- 已安装并能运行 DSH CLI。
- Node.js 22 或更高版本。
- pnpm 可被 DSH CLI 调用。

### 从 GitHub 安装

安装到默认 `web` profile：

```bash
dsh plugin --profile web add github:fastengiel-kurai/dsh-peekfile-everything
```

如果 pnpm 10 阻止 Git 依赖执行 `prepare`，请按终端提示，将 `@kurai/dsh-peekfile-everything` 加入该 profile 的 `pnpm-workspace.yaml` 中的 `allowBuilds`，然后重新执行安装命令。

安装完成后需要重启正在运行的 DSH profile。若本机已配置 `dshserver` 服务命令：

```bash
dshserver restart
```

`dshserver` 是本机服务包装命令，不属于 DSH 或 PeekFile 的标准依赖；其他环境请使用自己的进程管理方式重启 DSH Web。

### 从本地源码安装

```bash
git clone https://github.com/fastengiel-kurai/dsh-peekfile-everything.git
cd dsh-peekfile-everything
pnpm install
pnpm build
dsh plugin --profile web add .
```

本地安装适合开发调试。安装后仍需重启 DSH Web。

### 更新

GitHub 安装：

```bash
dsh plugin --profile web update @kurai/dsh-peekfile-everything
```

本地源码安装则先在仓库中执行 `git pull` 和 `pnpm build`，再重新运行：

```bash
dsh plugin --profile web add .
```

### 卸载

```bash
dsh plugin --profile web remove @kurai/dsh-peekfile-everything
```

更新或卸载后请重启 DSH Web。

## 设置页

安装并重启后，打开 DSH 的“设置 → PeekFile”。所有 PeekFile 参数都集中在独立一级设置页内，不再放在“WebUI 插件”中。

### 常规与预览

| 设置 | 作用 |
| --- | --- |
| 界面位置 | 在 PeekFile 浮动窗口与 Better Sidebar Tab 之间切换；未安装 Sidebar 时自动回退浮动窗口 |
| 预览处理 | 使用 PeekFile，或按文件类型分别选择 PeekFile / Better Sidebar |
| 启用文件搜索 | 显示并启用 PeekFiles 搜索入口 |
| 自动链接对话本地路径 | 将对话中有效的本地路径转换为可点击链接 |
| 识别代码块中的路径 | 控制是否处理代码块里的路径文本 |
| 允许拖入非图片文件 | 启用 `.dsh-drops/` 文件引用流程 |
| 每来源每页上限 | 分别控制工作目录、WSL 和 Everything 单页获取数量 |
| 本地预览上限 | `0` 表示不限制；只限制预览，不修改源文件 |
| 拖入对话框上限 | 默认 10 MB，只影响拖入输入框的文件 |

### 外挂工具

该页可分别启用、停用、修改命令路径并重新检测工具状态：

| 工具 | 用途 | Ubuntu / WSL 安装示例 |
| --- | --- | --- |
| FFmpeg | 视频截图、读取画面、转 MP4 | `sudo apt install ffmpeg` |
| AnyDoc | 将 PDF/Office 全文转为 Markdown 后加入会话 | `npm install -g @firecrawl/anydoc` |
| OfficeCLI | 将 Office 文档转换为可预览、可选字的 HTML | `npm install -g @officecli/officecli` |
| PDF Inspector | 判断 PDF 为文本、混合或全图类型 | `cargo install pdf-inspector --locked` |
| Calibre `ebook-convert` | MOBI/AZW/AZW3/FB2 转 EPUB | `sudo apt install calibre` |
| Unzip | 解包和读取 EPUB | `sudo apt install unzip` |
| Everything CLI | 搜索 Windows Everything 索引 | 在 Windows 安装 Everything 和 ES CLI，并配置 WSL 可调用路径 |
| ripgrep | 搜索工作目录和 WSL 文件 | `sudo apt install ripgrep` |

缺失某个外挂工具只会关闭依赖它的增强能力，不影响 PeekFile 的基础搜索、目录浏览和原生格式预览。

### MinerU OCR

MinerU 单独提供以下参数：

- 启用/停用 MinerU。
- API 地址与本地 Token 文件路径。
- VLM / Pipeline 模型。
- 语言、页码范围与超时时间。
- 表格识别和公式识别。

Token 保存在用户指定的本地文本文件中，由 PeekFile Host 读取，不返回浏览器前端。图片、框选截图和全图 PDF 的 OCR 结果可以直接加入当前会话。

## Everything 与跨系统搜索

Everything 只能索引 Windows 能访问的文件系统，不能直接索引 WSL 的 Linux 文件。PeekFile 因此提供三条独立通道：

1. 当前会话工作目录。
2. WSL 内部文件系统。
3. Windows Everything 索引。

在 Windows + WSL 环境中，请确保 `es.exe` 能从 WSL 执行，并在“设置 → PeekFile → 外挂工具”中填写它的实际路径。未安装 Everything 时可直接取消搜索栏中的 `Everything` 范围。

## 开发

```bash
pnpm install
pnpm test
pnpm build
```

项目结构：

```text
src/host.js        DSH Host、文件访问、搜索与外挂工具调用
src/client.js      Web UI、搜索面板、预览器与设置页
src/client-core.js 前端可测试的共享逻辑
src/core.js        路径、命中片段和搜索结果合并
src/office.js      Office 转换与缓存
src/ebook.js       EPUB/电子书处理
src/render.js      文本及格式渲染
tests/             Node 测试
```

构建产物写入 `lib/`。插件清单位于 `package.json`，DSH bundle 配置位于 `cordis.patch.yml`。

## 项目标识

- 显示名称：`PeekFile`
- 标题栏入口：`PeekFiles`
- 仓库与插件标识：`dsh-peekfile-everything`
- 包名：`@kurai/dsh-peekfile-everything`

## 当前限制

- Better Sidebar 的预览交接只适用于当前工作目录内的文件。
- 浏览器实际支持的视频编码取决于浏览器；容器后缀受支持不代表内部编码一定可播放。
- Office、PDF 全文提取、电子书转换、视频转码和 OCR 依赖对应外挂工具。
- macOS 画框截图仍处于预留状态，当前不显示入口。

## License

[MIT](LICENSE)
