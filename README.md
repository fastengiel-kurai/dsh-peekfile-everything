# PeekFile

面向 [DeepSeek Harness（DSH）](https://github.com/omdsh-dev/deepseek-harness) 的全盘文件搜索、目录浏览与多格式预览插件。

PeekFile 连接当前工作目录、WSL 文件系统和 Windows Everything 索引，把散落在不同磁盘与目录中的文件带回 DSH 会话：搜索、浏览、预览、复制内容、截图、OCR，或作为文件引用加入对话。

> 当前主要适配 Windows 11 + WSL2 Ubuntu 24.04 + DSH Web。Everything、Better Sidebar、文档转换与 OCR 工具均为可选组件；不安装它们也能使用工作目录/WSL 搜索、目录浏览和基础格式预览。

## ✅ 兼容性

| 项目 | 已验证环境 |
| --- | --- |
| DSH | `0.1.0-rc.8`，mainline commit `141eb6fef83422698aef7a981029e843e8161534` |
| Node.js | `>= 22` |
| 操作系统 | Windows 11 + WSL2 Ubuntu 24.04 |
| Better Sidebar（可选） | `0.14.0` |
| 最近验证日期 | 2026-08-22 |
| 验证记录 | [VERIFICATION.md](VERIFICATION.md) |

其他 Linux 环境可能可以运行，但尚未完成同等实机验证；macOS 目前隐藏画框截图入口。

<img width="1918" height="913" alt="侧边栏全景1" src="https://github.com/user-attachments/assets/e8b8ae12-a6df-4e58-8849-926840341894" />
## ✨ 主要功能模块

### 🔍 全盘文件搜索

PeekFile 的核心定位是搜索“当前项目之外”的文件。
<img width="762" height="726" alt="搜索界面001" src="https://github.com/user-attachments/assets/9f0f2588-4aca-4a85-b3f9-6f86aa7cd320" />

- **工作目录搜索**：优先显示当前会话所属工作目录中的文件（better sidebar只能预览工作目录内有权限的文档）。
- **WSL 搜索**：搜索 Linux/WSL 文件系统中的文件，如果wsl自己的搜索效率太低，也可以把\\wsl.localhost\Ubuntu-24.04\home\用户名 文件夹放到everything的索引目录列表中。
- **Everything 搜索**：调用 Windows Everything 索引搜索本地磁盘，everything 1.5版本，exe文件安装在win系统里，cli 也就是es命令安装在wsl里。。
- 以上三个搜索范围可多选，默认全选；取消某一来源后立即重组现有结果。
- 三个来源分别分页、分别受“每来源每页上限”控制，结果按“工作目录 → WSL → Everything”排序。
- 搜索结果只缓存在当前页面内存中，不写入磁盘；开始全新搜索时释放旧缓存。
- 在原查询后追加 `+关键词` 可筛选当前缓存，例如 `动画片 +合集`。
- 保存最近 10 条去重历史，点击历史词即可直接搜索。
- 显示文件名、类型、上级目录、搜索来源及文件名中的命中片段。
<img width="765" height="725" alt="二次筛选" src="https://github.com/user-attachments/assets/fb0a3238-6863-4ebe-8cb6-f930794f8827" />

### 🗂️ 目录浏览

- 点击目录在原位置打开目录内容。
- 支持上级目录、返回本次搜索结果和当前路径显示。
- 文件夹与不支持内嵌预览的压缩文件保留为列表条目。
- 压缩文件可交给系统关联程序打开，不在 PeekFile 内自动解包。

### 🔗 对话路径接管

不经过 PeekFile 搜索得到的路径同样可以预览。
<img width="1164" height="560" alt="image" src="https://github.com/user-attachments/assets/6590ff58-6f40-4fa0-8738-dc2393244538" />

- 自动识别对话中的 Windows、WSL/POSIX 和工作区本地路径。
- 将有效路径转换为可点击链接，使用与搜索结果相同的预览流程。
- 支持 DSH 原生文件引用胶囊及 `@路径:起始行-结束行` 引用。
- 可将路径、文本全文、文本选区、截图或 OCR 结果加入当前会话。
- 非图片文件可拖入输入框并保存到工作区 `.dsh-drops/`；默认单文件上限 10 MB。
- 本地预览默认不限制文件大小，预览上限可单独配置。

### 🪟 浮动预览工作台

- 默认使用可拖动、可缩放的浮动窗口，不占用固定侧边栏。
- 配色跟随 DSH/系统主题，预览背景保持不透明，避免正文相互干扰。
- 默认先显示文件列表；打开文件后折叠列表并进入全宽预览。
- 支持多 Tab、返回文件列表、中键关闭、刷新、另存为和系统打开。
- 文件操作菜单按格式能力生成，不向不支持的格式显示无效按钮。

## 🤝 与 Better Sidebar 配合使用

[DSH Better Sidebar](https://github.com/omdsh-dev/DSH-better-sidebar) 是工作目录内的侧边工作台，PeekFile 是跨目录、跨文件系统的全盘入口。两者不是互相替代，而是分工协作：
<img width="1918" height="913" alt="侧边栏全景1" src="https://github.com/user-attachments/assets/5e418532-9561-4fc4-bfc4-d66c47f74d9e" />

| 使用场景 | Better Sidebar | PeekFile |
| --- | --- | --- |
| 当前工作目录文件树 | 主要负责 | 可搜索并打开 |
| 工作目录内编辑与项目操作 | 主要负责 | 只读预览为主 |
| WSL 其他目录 | 不作为主要范围 | 主要负责搜索和预览 |
| Windows 本地磁盘 | 不作为主要范围 | 通过 Everything 搜索 |
| 对话中的绝对文件路径 | 工作目录内可接管 | 全局识别并提供兜底预览 |
| 界面形态 | 固定侧栏/底栏工作台 | 浮动窗口或注册为 Sidebar Tab |

PeekFile 提供两种配合方式：
<img width="801" height="806" alt="设置1" src="https://github.com/user-attachments/assets/3c368924-e633-4f56-89fc-9ec70dabe226" />


1. **界面位置**：选择“浮动窗口”时使用 PeekFile 自己的预览窗；选择“Better Sidebar”时，将 PeekFile 搜索主界面注册为 Sidebar Tab。
    <img width="955" height="916" alt="侧边栏1" src="https://github.com/user-attachments/assets/204a39c1-3d65-4f08-9db9-308a30b12e85" />
2. **预览处理**：选择“PeekFile”时全部由 PeekFile 处理；选择“按文件类型自定义”时，可分别指定文本、图片、视频、PDF、Office、电子书等由 PeekFile 或 Better Sidebar 打开。

当某类文件选择 Better Sidebar 时，PeekFile 只传递文件路径，后续预览和操作由 Sidebar 自己管理。由于 Sidebar 的文件服务以会话工作目录为边界，**工作目录以外的文件始终由 PeekFile 预览**，并提示“Sidebar只能预览工作目录内文件。”

未安装 Better Sidebar 时，相关选项自动禁用并回退到 PeekFile 浮动窗口。

## 👁️ 文件预览能力

| 文件类型 | 预览方式 | 主要操作 |
| --- | --- | --- |
| 文本、代码、脚本、Markdown、CSV | 带格式和行号的只读文本 | `@路径`、复制全文、复制选区、加入会话、信息、弹出、系统打开、刷新、另存为 |
| 图片 | 原图预览 | `@路径`、插入会话、画框截图、文本识别、系统打开、另存为 |
| 视频 | 浏览器播放器；不兼容时可转 MP4 | `@路径`、截图插入会话、截图另存、画框截图、转 MP4、字幕、播放器打开、另存为 |
| 文本/混合 PDF | 原始 PDF 预览，可直接选字 | `@路径`、选取复制、全文发送、画框截图、系统打开、另存为 |
| 全图 PDF | 原始 PDF 预览 | `@路径`、截图插入会话、截图 OCR、画框 OCR、系统打开、另存为 |
| Word、Excel、PowerPoint | OfficeCLI 转 HTML 预览，可选字 | `@路径`、选取复制、全文发送、画框截图、系统打开、另存为 |
| EPUB | 连续滚动阅读，章节无断点 | 上一页、下一页、当前进度、上一章、下一章、选取复制、截图 |
| MOBI、AZW、AZW3、FB2 | Calibre 转 EPUB 后阅读 | 与 EPUB 阅读器一致 |
| 压缩包及其他格式 | 不做内嵌预览 | 系统关联程序打开 |
<img width="1096" height="723" alt="电子书预览" src="https://github.com/user-attachments/assets/9678fcb6-cb55-4ed1-ad84-c5b20f6e7add" />

### 视频兼容与转码

- 优先尝试播放 MP4、WebM、MOV、M4V、MKV、AVI、WMV 等格式。
- 浏览器能否播放还取决于文件内部编码，而不只取决于后缀。
- 无法播放时显示“转 MP4”，由 FFmpeg 转为 H.264/AAC MP4 后自动播放。
- 输出位于源文件同目录，保留主文件名并改为 `.mp4`；若同名文件已存在则停止，不覆盖原文件。
- 点击画框截图前会先暂停当前视频并冻结点击时刻的画面。

<img width="1108" height="743" alt="视频播放" src="https://github.com/user-attachments/assets/c6138926-0383-42bd-867c-9419005c453e" />

### PDF、Office 与 OCR
<img width="1106" height="741" alt="office预览" src="https://github.com/user-attachments/assets/6032264e-f35a-4d0a-9052-8b687d4a7b76" />
- PDF Inspector 将 PDF 识别为文本、混合或全图类型，但所有类型都直接预览原始 PDF。
- 文本和混合 PDF 可使用 PDF 自带文本层直接选字，不需要先转换文档。
- Office 文档由 OfficeCLI 转成 HTML 进行浏览器预览和文本选择。
- PDF/Office 的“全文发送”才调用 AnyDoc 转为 Markdown，并以 Markdown 文件方式加入会话。
- 图片、截图和全图 PDF 的 OCR 可交给 MinerU，识别结果直接进入会话。
<img width="1108" height="741" alt="pdf预览" src="https://github.com/user-attachments/assets/2ed19204-5eb3-4a4d-b10e-0abb32e9f63c" />

### 电子书阅读
<img width="1096" height="723" alt="电子书预览" src="https://github.com/user-attachments/assets/974ad506-e404-40f6-a5eb-5b1dc93500b7" />

- EPUB 解包后按书脊顺序连续拼接章节，章与章之间可以直接滚动。
- 页面保持纵向滚动，不强制分页；上一页/下一页按可视区域滚动，因此可以停在两页之间进行截图。
- 提供上一章、下一章和当前进度，正文两侧保留阅读页边距。
- MOBI、AZW、AZW3、FB2 依赖 Calibre `ebook-convert` 转换后进入同一 EPUB 阅读器。

## 🚀 安装 PeekFile

### 前置条件

- DSH 已安装，`dsh web` 可以正常运行。
- Node.js 22 或更高版本。
- pnpm 可被 DSH CLI 调用。

### 从 GitHub 安装

```bash
dsh plugin --profile web add github:fastengiel-kurai/dsh-peekfile-everything
```

安装后重启 DSH Web。若你的机器已经配置本项目使用的服务命令：

```bash
dsh web
```

请先停止原有 DSH 进程，再用原来的工作目录和启动方式运行 `dsh web`，然后在浏览器中执行硬刷新（`Ctrl/Cmd + Shift + R`）。如果你自行配置了 systemd、PM2 或其他进程管理器，请使用对应的重启命令。

如果 pnpm 提示 `Ignored build scripts` 或阻止 Git 依赖执行 `prepare`，进入 profile 目录批准构建，再重新安装：

```bash
cd ~/.dsh/profiles/web
pnpm approve-builds --all
dsh plugin --profile web add github:fastengiel-kurai/dsh-peekfile-everything
```

### 从源码安装

```bash
git clone https://github.com/fastengiel-kurai/dsh-peekfile-everything.git
cd dsh-peekfile-everything
pnpm install
pnpm build
dsh plugin --profile web add .
```

### 更新

GitHub 安装通道：

```bash
dsh plugin --profile web update @kurai/dsh-peekfile-everything
```

源码通道：

```bash
git pull
pnpm install
pnpm build
dsh plugin --profile web add .
```

更新完成后重启 DSH，并硬刷新浏览器。

### 卸载

```bash
dsh plugin --profile web remove @kurai/dsh-peekfile-everything
```

### 最小使用示例

1. 启动 DSH Web，进入任意会话。
2. 点击会话右上角的 **PeekFiles**。
3. 在搜索框输入文件名，例如 `report.pdf`。
4. 保持“工作目录 / WSL / Everything”全选，点击搜索。
5. 点击目录可继续浏览；点击文件会切换到预览区。

Everything 未安装时，在搜索按钮后的范围菜单中取消 `Everything`，工作目录和 WSL 搜索仍可使用。也可以让模型在对话中输出一个有效本地路径，然后直接点击路径预览。

## 🧩 可选组件与外挂工具

PeekFile 不会自动修改操作系统环境。安装工具后，在“设置 → PeekFile → 外挂工具”中启用并填写命令路径，再点击“重新检测全部工具”。缺失某项只会关闭依赖它的增强能力。
<img width="792" height="804" alt="设置2" src="https://github.com/user-attachments/assets/8d972cc9-57a1-4803-a94c-7080f5071074" />

### Better Sidebar

用途：提供工作目录侧边工作台，并允许 PeekFile 注册 Tab 或把工作目录内文件交给其 Viewer。

```bash
dsh plugin --profile web add dsh-better-sidebar@latest
```

安装说明以 [Better Sidebar README](https://github.com/omdsh-dev/DSH-better-sidebar#-安装) 为准。安装后硬刷新浏览器；若 Host 部分未加载则重启 DSH。

### Everything 与 ES CLI（Windows，可选）

用途：搜索 Windows 本地磁盘。Everything 必须已经运行，PeekFile 从 WSL 调用 `es.exe`。

1. 从 [voidtools Everything](https://www.voidtools.com/downloads/) 安装 Everything 1.5（低于1.5版本的不能加载cli）。
2. 从 [ES CLI 下载页](https://www.voidtools.com/downloads/#cli) 下载与系统架构匹配的 `es.exe`。
3. 确认 Windows 中 Everything 正在运行。
4. 在 PeekFile 设置中填写 WSL 可访问路径，例如：

```text
/mnt/c/Tools/Everything/es.exe
```

验证：

```bash
/mnt/c/Tools/Everything/es.exe -version
```

为了兼容性，没有把wsl内部目录添加到everything索引目录列表中，everything搜不到wsl内部目录的文件，因此 PeekFile 另外提供 WSL 搜索通道。
如果你想让everything也接管wsl内的文件，也可以把\\wsl.localhost\Ubuntu-24.04\home\用户名，添加到everything索引目录中。（我没试，可能会造成wsl内的文件搜两次，需要每次关闭wsl内部搜索通道）


### FFmpeg

用途：视频读取、截图以及将浏览器不兼容的视频转为 MP4。

```bash
sudo apt update
sudo apt install ffmpeg
ffmpeg -version
```

### AnyDoc

用途：把 PDF 和 Office 全文转成 Markdown，用于“全文发送”。

```bash
npm install -g @firecrawl/anydoc
anydoc --help
```

项目：[firecrawl/anydoc](https://github.com/firecrawl/anydoc)

### OfficeCLI

用途：读取 Word、Excel、PowerPoint 并生成 HTML 预览。

```bash
npm install -g @officecli/officecli
officecli --version
```

项目：[iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI)

### PDF Inspector

用途：使用 `detect-pdf` 判断 PDF 类型，并提供 `pdf2md` 备用文本提取命令。

先安装 Rust/Cargo，再安装工具：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
cargo install pdf-inspector --locked
detect-pdf --help
pdf2md --help
```

项目：[firecrawl/pdf-inspector](https://github.com/firecrawl/pdf-inspector)

### Calibre ebook-convert

用途：把 MOBI、AZW、AZW3、FB2 等格式转换为 EPUB。

```bash
sudo apt update
sudo apt install calibre
ebook-convert --version
```

若出现 `spawn /usr/bin/ebook-convert ENOENT`，表示设置中的命令路径不存在或 Calibre 尚未安装。可运行 `command -v ebook-convert` 查找真实路径并填入 PeekFile 设置。

### Unzip

用途：解包 EPUB，读取目录、章节、图片和样式资源。

```bash
sudo apt update
sudo apt install unzip
unzip -v
```

### ripgrep

用途：枚举并筛选工作目录和 WSL 内部文件。

```bash
sudo apt update
sudo apt install ripgrep
rg --version
```

### MinerU OCR
<img width="804" height="807" alt="设置3" src="https://github.com/user-attachments/assets/014a8022-5925-4b59-86bf-89e0d06672b1" />
用途：识别图片、框选截图及全图 PDF 中的文字、表格和公式。

MinerU 在 PeekFile 中通过 API 使用，不要求安装本地 MinerU：

1. 在 [MinerU](https://mineru.net/) 获取 API Token。
2. 将 Token 单独保存为本地纯文本文件，例如 `~/.config/peekfile/mineru-token`。
3. 打开“设置 → PeekFile → MinerU OCR”。
4. 填写 API 地址、Token 文件路径、模型、语言、页码范围和超时时间。
5. 按需开启表格识别与公式识别。

Token 仅由 PeekFile Host 从本地文件读取，不返回浏览器前端，也不应提交到 Git 仓库。

## ⚙️ 设置页

所有参数集中在 DSH 的“设置 → PeekFile”，分为三个 Tab。

### 常规与预览

| 设置 | 说明 |
| --- | --- |
| 界面位置 | 浮动窗口或 Better Sidebar；Sidebar 不可用时自动回退 |
| 预览处理 | 全部使用 PeekFile，或按文件类型自定义 PeekFile/Sidebar |
| 启用文件搜索 | 控制 PeekFiles 搜索入口 |
| 自动链接对话本地路径 | 将对话中的有效路径转换为预览链接 |
| 识别代码块中的路径 | 决定是否处理代码块内的路径文字 |
| 允许拖入非图片文件 | 启用 `.dsh-drops/` 引用流程 |
| 每来源每页上限 | 分别限制工作目录、WSL、Everything 的单页数量 |
| 本地预览上限 | `0` 表示不限制 |
| 拖入对话框上限 | 默认 10 MB，仅影响拖入输入框的文件 |

### 外挂工具

集中管理 FFmpeg、AnyDoc、OfficeCLI、PDF Inspector、Calibre、Unzip、Everything CLI 和 ripgrep：

- 每项可单独启用或停用。
- 可修改可执行文件路径。
- 显示工具用途和简要安装命令。
- “重新检测全部工具”显示可用、缺失或已停用状态。

### MinerU OCR

- 启用/停用 MinerU。
- API 地址与本地 Token 文件路径。
- VLM/Pipeline 模型、语言和页码范围。
- 超时时间、表格识别和公式识别。

PeekFile 不读取专用环境变量。普通设置保存在浏览器 `localStorage` 的 `peekfile:settings` 中；搜索历史保存在 `peekfile:search-history` 中。MinerU Token 本身不进入浏览器设置，只保存其本地文件路径。

## 🔐 权限、网络与数据

| 能力 | PeekFile 的行为 |
| --- | --- |
| 本地文件读取 | 根据搜索、目录浏览和预览操作读取工作目录、WSL 路径及 Windows 挂载路径 |
| 本地文件写入 | 拖入文件时写入工作区 `.dsh-drops/`；转码时在源目录生成同名 `.mp4`；转换/OCR 缓存写入用户缓存目录 |
| 外部程序 | 仅在相应设置启用时调用 FFmpeg、AnyDoc、OfficeCLI、PDF Inspector、Calibre、Unzip、Everything CLI、ripgrep 或系统打开程序 |
| 网络访问 | 基础搜索和预览不需要联网；MinerU OCR 会把用户主动选择的文件或截图上传至配置的 MinerU API |
| 凭据 | MinerU Token 从用户指定的本地文件读取，只用于 Host 发起 OCR 请求，不返回前端、不写入仓库 |
| 浏览器存储 | 保存插件设置、搜索历史和界面偏好；搜索结果缓存仅驻留当前页面内存 |

安装前请确认 DSH 进程对目标目录拥有读取权限。启用转码、拖入、另存或 OCR 前，应确认你有权处理对应文件。不要把生产密钥、Token 文件或含敏感内容的样本提交到 Issue。

## ❓ 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| Everything 搜不到 WSL 文件 | Everything 只索引 Windows 可见文件；保持 WSL 搜索范围开启 |
| 选择 Sidebar 后仍由 PeekFile 打开 | 文件不在当前工作目录，或 Sidebar 没有匹配 Viewer；这是预期回退 |
| 视频无法直接播放 | 浏览器不支持容器或编码；安装 FFmpeg 后点击“转 MP4” |
| `spawn ... ENOENT` | 配置的外挂命令不存在；安装对应工具或填写 `command -v 工具名` 返回的路径 |
| Office/PDF 没有全文发送 | AnyDoc 未安装、被停用或路径错误 |
| MOBI/AZW 无法预览 | Calibre `ebook-convert` 未安装或路径错误 |
| OCR 不可用 | 检查 MinerU 开关、Token 文件、API 地址与网络状态 |
| 设置没有出现 PeekFile | 硬刷新浏览器；仍无效时重启 DSH，并确认插件已加入 `web` profile |

### 日志与回滚

- 前端错误：打开浏览器开发者工具，查看 Console 和 Network 中的 `/__peekfile/` 请求。
- Host 错误：查看启动 `dsh web` 的终端输出；若使用 systemd，请查看对应 user service 日志。
- 外挂工具错误：先在终端运行设置页显示的可执行路径和 `--version`/`-version`，再点击“重新检测全部工具”。
- 回滚：执行卸载命令，重启 DSH；如需恢复旧版本，请使用固定 commit 安装，例如 `github:fastengiel-kurai/dsh-peekfile-everything#<commit>`。

## 🛠️ 开发

```bash
pnpm install
pnpm test
pnpm build
```

```text
src/host.js        Host、文件访问、搜索与外挂工具调用
src/client.js      Web UI、搜索面板、预览器与设置页
src/client-core.js 前端共享与可测试逻辑
src/core.js        路径、命中片段和搜索结果合并
src/office.js      Office 转换与缓存
src/ebook.js       EPUB 与电子书处理
src/render.js      文本及格式渲染
tests/             Node 测试
```

- 显示名称：`PeekFile`
- 标题栏入口：`PeekFiles`
- 仓库：`dsh-peekfile-everything`
- 包名：`@kurai/dsh-peekfile-everything`
- Node.js：`>= 22`

贡献代码前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。插件目录提交步骤见 [docs/CATALOG-SUBMISSION.md](docs/CATALOG-SUBMISSION.md)。

## 当前限制

- Better Sidebar 交接仅适用于当前工作目录内的文件。
- 浏览器视频解码能力受运行环境影响，部分格式必须转码。
- Office/PDF 全文、电子书转换、视频转码和 OCR 依赖对应外挂工具。
- macOS 已保留截图接口，但当前隐藏画框截图入口，等待实机验证。

## 🔒 安全报告

请不要在公开 Issue 中粘贴 Token、私人文件路径或包含敏感内容的日志。安全漏洞请通过 GitHub 的 [Private vulnerability reporting](https://github.com/fastengiel-kurai/dsh-peekfile-everything/security/advisories/new) 私下报告，详细策略见 [SECURITY.md](SECURITY.md)。普通缺陷和功能建议可使用 [GitHub Issues](https://github.com/fastengiel-kurai/dsh-peekfile-everything/issues)。

## License

[MIT](LICENSE)
