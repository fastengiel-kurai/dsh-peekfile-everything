# Plugin catalog submission

This document records the submission metadata and steps for two community catalogs. Re-read each catalog's current contribution guide before submitting because their schema and workflow may change.

## Plugin metadata

- Repository: `https://github.com/fastengiel-kurai/dsh-peekfile-everything`
- Package: `@kurai/dsh-peekfile-everything`
- Chinese description: `DSH 全盘文件搜索与预览插件，统一搜索工作目录、WSL 和 Windows Everything 索引，并提供本地多格式预览与会话引用。`
- English description: `A DSH plugin that searches workspace, WSL, and Windows Everything sources and provides local multi-format preview and conversation references.`
- Verification: [../VERIFICATION.md](../VERIFICATION.md)

## AdamPlatin123/awesome-dsh-plugins

1. Confirm the public plugin repository has the `dsh-plugin` topic.
2. Fork `AdamPlatin123/awesome-dsh-plugins` and create a branch from its current `main`.
3. Add one row to the appropriate table in `PLUGINS.md` without editing generated reports.
4. Use PR title `docs: 登记 dsh-peekfile-everything`.
5. Complete the plugin submission template, include the real DSH version/commit and test results, and enable **Allow edits from maintainers**.

Suggested row:

```markdown
| dsh-peekfile-everything | [fastengiel-kurai/dsh-peekfile-everything](https://github.com/fastengiel-kurai/dsh-peekfile-everything) | DSH 全盘文件搜索与预览插件：统一搜索工作目录、WSL 和 Windows Everything 索引，支持本地多格式预览、路径接管、会话引用，并可与 Better Sidebar 配合管理工作目录内文件 | 待测 |
```

## imsai-sh/awesome-deepseek-harness-plugins

1. Fork `imsai-sh/awesome-deepseek-harness-plugins` and create a branch from its current `main`.
2. Add exactly one file: `catalog/plugins/fastengiel-kurai--dsh-peekfile-everything.json`.
3. Do not edit README, workflows, application code, or any other file in that PR.
4. Open a non-draft PR and complete the catalog checklist. A passing `Plugin submission review / static-review` can auto-merge a single new entry.

Proposed JSON (confirm the catalog's current category vocabulary before submission):

```json
{
  "$schema": "../schema/plugin.schema.json",
  "id": "fastengiel-kurai/dsh-peekfile-everything",
  "name": "dsh-peekfile-everything",
  "repository": "https://github.com/fastengiel-kurai/dsh-peekfile-everything",
  "category": "ui",
  "description": {
    "en": "A DSH plugin that searches workspace, WSL, and Windows Everything sources and provides local multi-format preview and conversation references.",
    "zh": "DSH 全盘文件搜索与预览插件，统一搜索工作目录、WSL 和 Windows Everything 索引，并提供本地多格式预览与会话引用。"
  },
  "added": "2026-08-22"
}
```

## Pre-submission checklist

- Repository is public and has the `dsh-plugin` topic.
- Root `package.json` has a non-empty `dsh.bundle.patch`.
- `cordis.patch.yml` is committed.
- GitHub installation succeeds through the self-contained `prepare` script.
- Runtime and peer dependencies are declared.
- README covers overview, compatibility, install/update/uninstall, quick start, configuration, permissions/data, troubleshooting, development, license, and private security reporting.
- Tests and runtime smoke evidence are current.
- No keys, private data, local token files, or unredacted logs are committed.
