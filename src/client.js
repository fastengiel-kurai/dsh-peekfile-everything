const inject = ["sessions", "conversation"];
const h = React.createElement;
const CSS = `
.peekfile-btn{border:0;background:transparent;color:inherit;cursor:pointer;padding:6px 9px;border-radius:8px}.peekfile-btn:hover{background:var(--peek-hover)}.peekfile-btn:disabled{opacity:.4;cursor:not-allowed}
.peekfile-session-button{display:inline-flex;align-items:center;justify-content:center;min-width:111px;height:32px;padding:6px 12px;gap:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:18px;color:var(--dsw-alias-label-primary);background:transparent;font-family:var(--dsw-font-family);font-size:13px;font-weight:400;line-height:20px;cursor:pointer}.peekfile-session-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.peekfile-session-button:disabled{color:var(--dsw-alias-label-dimmed);cursor:wait}.peekfile-session-button span,.peekfile-session-button svg{flex:none}.peekfile-session-button span{white-space:nowrap}
.peekfile-panel{--peek-base:var(--dsw-alias-bg-base,#fff);--peek-bg:var(--dsw-alias-bg-layer-1,#fff);--peek-bg-soft:var(--dsw-alias-bg-layer-2,#f7f7f5);--peek-text:var(--dsw-alias-label-primary,#37352f);--peek-muted:var(--dsw-alias-label-secondary,#787774);--peek-border:var(--dsw-alias-border-l2,#e8e7e4);--peek-divider:color-mix(in srgb,var(--peek-text) 38%,transparent);--peek-hover:var(--dsw-alias-interactive-bg-hover,#f1f1ef);--peek-accent:var(--dsw-alias-state-business-primary,#2383e2);color-scheme:inherit;container-type:inline-size;position:fixed;top:64px;right:24px;height:min(720px,calc(100vh - 88px));min-width:560px;min-height:360px;resize:both;z-index:3000;background:linear-gradient(var(--peek-bg),var(--peek-bg)),var(--peek-base);color:var(--peek-text);border:1px solid var(--peek-border);border-radius:14px;box-shadow:0 18px 60px #0003;display:flex;flex-direction:column;overflow:hidden;isolation:isolate}.peekfile-panel.peekfile-browse{width:min(760px,calc(100vw - 48px))}.peekfile-panel.peekfile-previewing{width:min(1100px,calc(100vw - 48px))}.peekfile-panel.peekfile-embedded{position:relative;inset:auto;width:100%;height:100%;min-width:0;min-height:0;resize:none;z-index:auto;border:0;border-radius:0;box-shadow:none}.peekfile-panel.peekfile-embedded.peekfile-browse,.peekfile-panel.peekfile-embedded.peekfile-previewing{width:100%}.peekfile-embedded .peekfile-bar{cursor:default}
@media (prefers-color-scheme:dark){.peekfile-panel{--peek-base:var(--dsw-alias-bg-base,#191919);--peek-bg:var(--dsw-alias-bg-layer-1,#191919);--peek-bg-soft:var(--dsw-alias-bg-layer-2,#242424);--peek-text:var(--dsw-alias-label-primary,#e6e6e4);--peek-muted:var(--dsw-alias-label-secondary,#a3a3a0);--peek-border:var(--dsw-alias-border-l2,#373737);--peek-hover:var(--dsw-alias-interactive-bg-hover,#2c2c2c);--peek-accent:var(--dsw-alias-state-business-primary,#529cca);box-shadow:0 18px 60px #0009}}
body[data-ds-dark-theme] .peekfile-panel{--peek-gradient-top:#15213d;--peek-gradient-bottom:#113881;background:linear-gradient(var(--peek-gradient-top),var(--peek-gradient-bottom)),#9ca3af}
@supports (color:oklch(from red l c h)){body[data-ds-dark-theme] .peekfile-panel{--peek-gradient-top:oklch(from var(--peek-accent) 25.2845% 0.05578 calc(h + 4.3112));--peek-gradient-bottom:oklch(from var(--peek-accent) 36.2172% 0.13102 calc(h + .6505))}}
.peekfile-bar{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--peek-border);cursor:move}.peekfile-searchbox{position:relative;flex:1}.peekfile-input{width:100%;box-sizing:border-box;background:var(--peek-bg-soft);color:inherit;border:1px solid var(--peek-border);border-radius:8px;padding:8px 11px;outline:none}.peekfile-input:focus{border-color:var(--peek-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--peek-accent) 20%,transparent)}.peekfile-history{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:5;padding:5px;background:var(--peek-bg);border:1px solid var(--peek-border);border-radius:9px;box-shadow:0 10px 30px #0003}.peekfile-history-item{display:flex;align-items:center;gap:8px;width:100%;padding:7px 9px;border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;cursor:pointer}.peekfile-history-item:hover,.peekfile-history-item:focus{background:var(--peek-hover);outline:none}.peekfile-history-icon{color:var(--peek-muted)}.peekfile-history-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.peekfile-scopes{position:relative}.peekfile-scope-menu{position:absolute;top:calc(100% + 6px);right:0;z-index:7;width:190px;padding:7px;background:var(--peek-bg);border:1px solid var(--peek-border);border-radius:9px;box-shadow:0 10px 30px #0005}.peekfile-scope-option{display:flex;align-items:center;gap:8px;padding:6px;border-radius:6px;cursor:pointer;white-space:nowrap}.peekfile-scope-option:hover{background:var(--peek-hover)}.peekfile-scope-option input{accent-color:var(--peek-accent)}.peekfile-scope-workspace{color:#b45309}.peekfile-scope-wsl{color:#047857}.peekfile-scope-everything{color:#7c3aed}body[data-ds-dark-theme] .peekfile-scope-workspace{color:#fbbf24}body[data-ds-dark-theme] .peekfile-scope-wsl{color:#34d399}body[data-ds-dark-theme] .peekfile-scope-everything{color:#c084fc}.peekfile-cache-note{padding:5px 6px 2px;border-top:1px solid var(--peek-border);color:var(--peek-muted);font-size:10px}.peekfile-cache-clear{width:100%;margin-top:4px}
.peekfile-body{display:flex;min-height:0;flex:1}.peekfile-results{overflow:auto;flex:1;padding:0 12px 14px}.peekfile-listhead,.peekfile-row{display:grid;grid-template-columns:minmax(180px,1.25fr) 70px minmax(110px,.7fr) 72px 38px;gap:9px;align-items:center}.peekfile-listhead{padding:7px 22px;background:var(--peek-bg);color:var(--peek-muted);font-size:11px;border-bottom:1px solid var(--peek-border)}.peekfile-row{margin-top:3px;padding:8px 10px;border-left:2px solid var(--peek-file-color,#c99a6b);border-bottom:1px dashed var(--peek-divider);border-radius:0 6px 6px 0;cursor:pointer}.peekfile-row:hover,.peekfile-row.active{background:var(--peek-hover)}.peekfile-tone-folder{--peek-file-color:#d59a35}.peekfile-tone-document{--peek-file-color:#d97841}.peekfile-tone-sheet{--peek-file-color:#b89036}.peekfile-tone-slides{--peek-file-color:#e05a3f}.peekfile-tone-pdf{--peek-file-color:#c7473d}.peekfile-tone-image{--peek-file-color:#dc7b67}.peekfile-tone-media{--peek-file-color:#b96873}.peekfile-tone-book{--peek-file-color:#a96f45}.peekfile-tone-code{--peek-file-color:#c68457}.peekfile-tone-archive{--peek-file-color:#9f7658}.peekfile-tone-file{--peek-file-color:#c99a6b}.peekfile-name,.peekfile-path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.peekfile-name{font-weight:500}.peekfile-type{color:var(--peek-muted);font-size:12px}.peekfile-path{font-size:11px;color:var(--peek-muted)}.peekfile-parent{color:var(--peek-accent);text-decoration:none}.peekfile-reason{justify-self:start;padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--peek-file-color) 18%,transparent);color:var(--peek-text);font-size:10px;white-space:nowrap}.peekfile-footer{display:flex;align-items:center;min-width:0;min-height:40px;padding:4px 12px;background:var(--peek-bg);color:var(--peek-muted);font-size:11px;border-top:1px solid var(--peek-border);white-space:nowrap;overflow:hidden}.peekfile-footer-controls{display:flex;align-items:center;gap:4px;flex:0 0 252px;width:252px;white-space:nowrap}.peekfile-footer-controls .peekfile-btn{flex:none}.peekfile-footer-path{flex:1 1 auto;min-width:0;margin-left:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--peek-text)}
.peekfile-source-workspace .peekfile-name,.peekfile-source-workspace .peekfile-type,.peekfile-source-workspace .peekfile-reason{color:#b45309}.peekfile-source-wsl .peekfile-name,.peekfile-source-wsl .peekfile-type,.peekfile-source-wsl .peekfile-reason{color:#047857}.peekfile-source-everything .peekfile-name,.peekfile-source-everything .peekfile-type,.peekfile-source-everything .peekfile-reason{color:#7c3aed}
body[data-ds-dark-theme] .peekfile-source-workspace .peekfile-name,body[data-ds-dark-theme] .peekfile-source-workspace .peekfile-type,body[data-ds-dark-theme] .peekfile-source-workspace .peekfile-reason{color:#fbbf24}body[data-ds-dark-theme] .peekfile-source-wsl .peekfile-name,body[data-ds-dark-theme] .peekfile-source-wsl .peekfile-type,body[data-ds-dark-theme] .peekfile-source-wsl .peekfile-reason{color:#34d399}body[data-ds-dark-theme] .peekfile-source-everything .peekfile-name,body[data-ds-dark-theme] .peekfile-source-everything .peekfile-type,body[data-ds-dark-theme] .peekfile-source-everything .peekfile-reason{color:#c084fc}
.peekfile-preview{display:flex;flex:1;flex-direction:column;min-width:0;min-height:0}.peekfile-tabs{display:flex;align-items:center;overflow:auto;background:var(--peek-bg-soft);border-bottom:1px solid var(--peek-border);cursor:move;user-select:none}.peekfile-tab{display:flex;flex:none;gap:6px;align-items:center;padding:8px 10px;max-width:190px;cursor:pointer;border-right:1px solid var(--peek-border)}.peekfile-tab.active{background:var(--peek-bg)}.peekfile-tab-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.peekfile-tab-x{opacity:.6}.peekfile-tab-notice{flex:0 1 auto;min-width:0;margin-left:auto;padding:0 10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--peek-muted);font-size:10px}.peekfile-frame{width:100%;height:100%;border:0;background:var(--peek-bg)}.peekfile-empty{display:grid;place-items:center;height:100%;color:var(--peek-muted)}
.peekfile-previewbar{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:6px 9px;border-bottom:1px solid var(--peek-border);font-size:11px;cursor:move}.peekfile-previewbar .peekfile-btn{cursor:pointer}.peekfile-previewtitle{flex:1;min-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--peek-muted)}
.peekfile-crumbs{display:flex;gap:3px;align-items:center;padding:7px 12px;overflow:auto;white-space:nowrap;border-bottom:1px solid var(--peek-border)}.peekfile-crumb{color:var(--peek-accent);cursor:pointer}.peekfile-error{padding:7px 12px;color:var(--dsw-alias-state-error-primary,#e03e3e)}.peekfile-link{color:var(--peek-accent);text-decoration:underline dotted;cursor:pointer}
.peekfile-settings{display:flex;flex-direction:column;gap:12px;width:100%;height:100%;max-height:calc(100vh - 112px);overflow-y:auto;overscroll-behavior:contain;padding:12px 18px 40px;background-color:inherit}.peekfile-settings h2,.peekfile-settings h3{margin:4px 0}.peekfile-settings h3{position:static;padding:8px 0 5px;background:none}.peekfile-setting{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:30px}.peekfile-setting span{font-size:12px}.peekfile-setting select,.peekfile-setting input[type=number]{width:170px;background:transparent;color:inherit;border:1px solid rgba(127,127,127,.4);border-radius:6px;padding:4px 7px}.peekfile-settings-group{display:flex;flex-direction:column;gap:7px;padding:10px;border:1px solid rgba(127,127,127,.25);border-radius:9px}.peekfile-setting-note{font-size:11px;color:#888}
.peekfile-settings-tabs{display:flex;gap:6px;position:sticky;top:-12px;z-index:10;margin:0 -18px;padding:12px 18px 9px;background-color:inherit;border-bottom:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.25));box-shadow:0 3px 8px rgba(0,0,0,.06);isolation:isolate}.peekfile-settings-tab{padding:6px 11px;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));border-radius:16px;background:transparent;color:inherit;cursor:pointer}.peekfile-settings-tab.active{background:var(--dsw-alias-interactive-bg-active,rgba(127,127,127,.18));border-color:var(--dsw-alias-state-business-primary,#4176e6)}
.peekfile-tool{padding:8px;border:1px solid rgba(127,127,127,.25);border-radius:8px}.peekfile-tool-head{display:flex;align-items:center;gap:8px}.peekfile-tool-head strong{flex:1}.peekfile-tool-status{font-size:10px;color:var(--peek-muted)}.peekfile-tool-status.ok{color:#16a34a}.peekfile-tool-status.missing{color:#dc2626}.peekfile-tool-path{width:100%;box-sizing:border-box;margin-top:5px;background:transparent;color:inherit;border:1px solid rgba(127,127,127,.4);border-radius:6px;padding:4px 6px}.peekfile-tool-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:6px}
.peekfile-crop-overlay{position:fixed;inset:0;z-index:9997;cursor:crosshair;background:#000}.peekfile-crop-frame{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}.peekfile-crop-selection{position:absolute;border:2px solid #f59e0b;background:#f59e0b26;display:none;pointer-events:none}.peekfile-crop-actions{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);z-index:2;display:flex;gap:10px;padding:8px 14px;border-radius:10px;background:#000c}.peekfile-crop-actions button{border:1px solid #999;background:#222;color:#fff;border-radius:8px;padding:6px 14px;cursor:pointer}.peekfile-crop-actions button:first-child{border-color:#f59e0b;background:#f59e0b;color:#111;font-weight:600}
@container (max-width:520px){.peekfile-listhead,.peekfile-row{grid-template-columns:minmax(0,1fr) 58px 34px}.peekfile-listhead>:nth-child(3),.peekfile-listhead>:nth-child(4),.peekfile-row>:nth-child(3),.peekfile-row>:nth-child(4){display:none}.peekfile-bar{padding:8px}.peekfile-results{padding-left:7px;padding-right:7px}}
`;
const api = async (method, args = {}) => {
  const r = await fetch("/__peekfile/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ method, args }),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error);
  return j.value;
};
const samePath = (a, b) => a?.path === b?.path;
const linePreviewExtensions = new Set([
  "txt",
  "log",
  "md",
  "markdown",
  "rst",
  "adoc",
  "org",
  "tex",
  "json",
  "jsonl",
  "js",
  "mjs",
  "cjs",
  "jsx",
  "ts",
  "tsx",
  "py",
  "rs",
  "go",
  "java",
  "c",
  "cc",
  "cpp",
  "h",
  "hpp",
  "cs",
  "php",
  "rb",
  "pl",
  "pm",
  "lua",
  "swift",
  "kt",
  "kts",
  "scala",
  "r",
  "dart",
  "ex",
  "exs",
  "erl",
  "hrl",
  "clj",
  "cljs",
  "groovy",
  "gradle",
  "asm",
  "s",
  "sol",
  "proto",
  "graphql",
  "gql",
  "sh",
  "bash",
  "zsh",
  "fish",
  "ps1",
  "bat",
  "cmd",
  "css",
  "scss",
  "less",
  "yaml",
  "yml",
  "toml",
  "ini",
  "cfg",
  "conf",
  "properties",
  "env",
  "lock",
  "xml",
  "sql",
  "vue",
  "svelte",
  "html",
  "htm",
  "xhtml",
  "csv",
  "tsv",
  "srt",
  "vtt",
  "ass",
  "ssa",
  "sub",
]);
const isLinePreview = (target) =>
  linePreviewExtensions.has(String(target?.extension || "").toLowerCase());
const fileTone = (item) => {
  if (item.kind === "directory") return "folder";
  const extension = (item.extension || "").toLowerCase();
  if (["doc", "docx", "odt", "rtf"].includes(extension)) return "document";
  if (["xls", "xlsx", "ods", "csv", "tsv"].includes(extension)) return "sheet";
  if (["ppt", "pptx", "odp"].includes(extension)) return "slides";
  if (extension === "pdf") return "pdf";
  if (
    [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "bmp",
      "ico",
      "avif",
      "heic",
    ].includes(extension)
  )
    return "image";
  if (
    [
      "mp3",
      "wav",
      "flac",
      "aac",
      "m4a",
      "ogg",
      "mp4",
      "mkv",
      "mov",
      "avi",
      "webm",
      "wmv",
      "rm",
      "rmvb",
    ].includes(extension)
  )
    return "media";
  if (["epub", "mobi", "azw", "azw3", "fb2"].includes(extension)) return "book";
  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "go",
      "rs",
      "java",
      "c",
      "cc",
      "cpp",
      "h",
      "hpp",
      "cs",
      "php",
      "rb",
      "sh",
      "bash",
      "zsh",
      "ps1",
      "html",
      "css",
      "scss",
      "json",
      "yaml",
      "yml",
      "toml",
      "xml",
      "md",
      "txt",
    ].includes(extension)
  )
    return "code";
  if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(extension))
    return "archive";
  return "file";
};

function apply(ctx) {
  const slots = ctx.get("slots");
  if (!slots) return;
  ctx.effect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => style.remove();
  });
  let openPanel = () => {};
  let sidebarPendingTarget = null;
  const defaultFamilyRoutes = Object.fromEntries(
    previewFamilies.map(([key]) => [key, "peekfile"]),
  );
  const defaultTools = {
    ffmpeg: { enabled: true, path: "/usr/bin/ffmpeg" },
    anydoc: {
      enabled: true,
      path: "/home/kurai/.local/share/fnm/node-versions/v22.22.3/installation/bin/anydoc",
    },
    officecli: {
      enabled: true,
      path: "/home/kurai/.nvm/versions/node/v26.2.0/bin/officecli",
    },
    pdfInspector: {
      enabled: true,
      detectPath: "/home/kurai/.cargo/bin/detect-pdf",
      convertPath: "/home/kurai/.cargo/bin/pdf2md",
    },
    ebookConvert: { enabled: true, path: "/usr/bin/ebook-convert" },
    unzip: { enabled: true, path: "/usr/bin/unzip" },
    everything: { enabled: true, path: "/home/kurai/.local/bin/es" },
    ripgrep: { enabled: true, path: "/usr/bin/rg" },
    mineru: {
      enabled: true,
      endpoint: "https://mineru.net",
      tokenPath:
        "/mnt/q/ChuckStudyStore/PilotDeckagent/secrets/mineru_api_token",
      modelVersion: "vlm",
      language: "ch",
      enableTable: true,
      enableFormula: true,
      pageRanges: "",
      timeoutSeconds: 600,
    },
  };
  const defaults = {
    search: true,
    autoLink: true,
    codePaths: false,
    drops: true,
    limit: 50,
    previewLimitMb: 0,
    dropLimitMb: 10,
    surfaceMode: "floating",
    previewRoutingMode: "peekfile-first",
    previewFamilyRoutes: defaultFamilyRoutes,
    tools: defaultTools,
  };
  const loadSearchHistory = () => {
    try {
      const values = JSON.parse(
        localStorage.getItem("peekfile:search-history") || "[]",
      );
      return Array.isArray(values)
        ? values
            .filter((value) => typeof value === "string" && value.trim())
            .slice(0, 10)
        : [];
    } catch {
      return [];
    }
  };
  const updatedSearchHistory = (history, value) => {
    const clean = String(value).trim();
    if (!clean) return history;
    const key = clean.toLocaleLowerCase();
    return [
      clean,
      ...history.filter((item) => item.toLocaleLowerCase() !== key),
    ].slice(0, 10);
  };
  let preferences = defaults;
  try {
    const saved = JSON.parse(localStorage.getItem("peekfile:settings") || "{}"),
      legacySidebar = saved.previewRoutingMode === "sidebar-first",
      savedRoutes = Object.fromEntries(
        Object.entries(saved.previewFamilyRoutes || {}).map(([key, value]) => [
          key,
          value === "auto" ? "sidebar" : value,
        ]),
      ),
      savedTools = Object.fromEntries(
        Object.entries(defaultTools).map(([key, value]) => [
          key,
          { ...value, ...saved.tools?.[key] },
        ]),
      );
    preferences = {
      ...defaults,
      ...saved,
      tools: savedTools,
      previewRoutingMode: legacySidebar
        ? "custom"
        : saved.previewRoutingMode || defaults.previewRoutingMode,
      previewFamilyRoutes: {
        ...defaultFamilyRoutes,
        ...(legacySidebar
          ? Object.fromEntries(previewFamilies.map(([key]) => [key, "sidebar"]))
          : savedRoutes),
      },
    };
  } catch {}
  const savePreferences = (next) => {
    preferences = { ...preferences, ...next };
    localStorage.setItem("peekfile:settings", JSON.stringify(preferences));
    window.dispatchEvent(
      new CustomEvent("peekfile:settings", { detail: preferences }),
    );
  };
  const inputTriggers = ctx.get("inputTriggers");
  if (inputTriggers) {
    try {
      ctx.effect(() =>
        inputTriggers.registerSource({
          trigger: "@",
          name: "file",
          order: 30,
          candidates: async (_session, request) => {
            if (!preferences.search || !request.query.trim()) return [];
            try {
              const result = await api("search-page", {
                  query: request.query,
                  page: 0,
                  pageSize: 10,
                  cwd: activeInput()?.cwd,
                  tools: preferences.tools,
                }),
                results = result.items;
              return Promise.all(
                results
                  .filter((item) => item.kind === "file")
                  .map(async (item) => {
                    const lineResult = await api("lines", {
                      path: item.path,
                    }).catch(() => ({ lines: 1 }));
                    return {
                      name: item.name,
                      description: item.parent,
                      hint: `${item.extension || "文件"} · ${lineResult.lines} 行`,
                      peekfileTarget: item,
                      peekfileLines: lineResult.lines,
                    };
                  }),
              );
            } catch {
              return [];
            }
          },
          onPick: ({ candidate }) => {
            const target = candidate.peekfileTarget;
            if (!target) return undefined;
            const lines = candidate.peekfileLines || 1,
              token = `@${target.path}:1-${lines}`;
            return {
              insert: {
                source: "file",
                ref: token,
                label: `${target.name} 1-${lines}`,
                clipboardText: token,
              },
            };
          },
          codec: {
            clipboardText: (ref) => ref,
            serialize: (ref) => Promise.resolve(ref),
          },
        }),
      );
    } catch (error) {
      console.warn("[peekfile] file reference codec:", error);
    }
  }
  const activeInput = () => {
    const snapshot = ctx.sessions.list.getSnapshot(),
      sessionId = snapshot.current;
    if (!sessionId) return null;
    const actx = ctx.sessions.scope(sessionId);
    if (!actx) return null;
    return {
      sessionId,
      actx,
      shell: ctx.conversation.input.for(actx),
      cwd: snapshot.byId?.[sessionId]?.cwd || "",
    };
  };
  const insertDraftText = (text, separator = " ") => {
    const current = activeInput();
    if (!current) return false;
    const snapshot = current.shell.state.getSnapshot(),
      draft = snapshot.draft || "",
      insert = `${draft.trim() ? separator : ""}${text}`;
    return (
      current.actx.bail(current.actx, "slash/input-insert-text", {
        text: insert,
        span: {
          start: draft.length,
          end: draft.length,
          draftRev: snapshot.draftRev,
        },
      }) === true
    );
  };
  const appendText = (text) => insertDraftText(text, " ");
  const insertReference = async (target, range = null) => {
    if (target.kind === "directory")
      return appendText(`@${target.path.replace(/\/$/, "")}/ `);
    if (!isLinePreview(target)) throw new Error("当前文件不是可按行引用的文本");
    const current = activeInput();
    if (!current) throw new Error("当前没有可用的对话输入框");
    const lineResult =
        range ||
        (await api("lines", { path: target.sourcePath || target.path })),
      start = range?.start || 1,
      end = range?.end || lineResult.lines,
      path = target.sourcePath || target.path,
      token = `@${path}:${start}-${end}`,
      snapshot = current.shell.state.getSnapshot(),
      reference = {
        source: "file",
        ref: token,
        label: target.name,
        clipboardText: token,
      },
      inserted = current.actx.bail(
        current.actx,
        "slash/input-insert-reference",
        {
          reference,
          span: {
            start: snapshot.draft.length,
            end: snapshot.draft.length,
            draftRev: snapshot.draftRev,
          },
        },
      );
    if (inserted !== true) throw new Error("文件引用未能插入当前对话");
    return true;
  };
  const currentScope = () => {
    const current = activeInput();
    return current ? { sessionId: current.sessionId, cwd: current.cwd } : null;
  };
  const betterSidebar = () => ctx.get("betterSidebar");
  const searchIcon = (size) =>
    h(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
      },
      h("circle", { cx: 11, cy: 11, r: 7 }),
      h("path", { d: "m20 20-3.6-3.6" }),
    );
  const treeHasPane = (node, paneId) =>
    Boolean(
      node &&
        paneId &&
        (node.kind === "leaf"
          ? node.id === paneId
          : node.children?.some((child) => treeHasPane(child, paneId))),
    );
  const peekfilePanelOf = (state) =>
    treeHasPane(state?.bottomSplits, state?.activePane) ? "bottom" : "side";
  const openSurface = (target) => {
    const service = betterSidebar(),
      scope = currentScope(),
      tabReady =
        service?.getTab?.("peekfile:browser") &&
        service?.isTabEnabled?.("peekfile:browser") !== false;
    if (preferences.surfaceMode === "sidebar" && tabReady && scope) {
      try {
        const panel = peekfilePanelOf(service.getSnapshot?.().state);
        sidebarPendingTarget = target ? { target, panel } : null;
        service.openTab({ type: "peekfile:browser", title: "PeekFile" }, scope);
        if (target)
          requestAnimationFrame(() =>
            window.dispatchEvent(new CustomEvent("peekfile:sidebar-open")),
          );
        return;
      } catch (error) {
        sidebarPendingTarget = null;
        console.warn(
          "[peekfile] Better Sidebar open failed, using floating panel:",
          error,
        );
      }
    }
    openPanel(target);
  };
  function Button() {
    return h(
      "button",
      {
        className: "peekfile-session-button",
        title: "PeekFiles 文件搜索与预览",
        onClick: () => openSurface(),
      },
      searchIcon(16),
      h("span", null, "PeekFiles"),
    );
  }
  function Panel({
    embedded = false,
    initialOpen = false,
    panelKey = "floating",
  } = {}) {
    const [open, setOpen] = React.useState(initialOpen),
      [view, setView] = React.useState("browse"),
      [query, setQuery] = React.useState(""),
      [history, setHistory] = React.useState(loadSearchHistory),
      [showHistory, setShowHistory] = React.useState(false),
      [showScopes, setShowScopes] = React.useState(false),
      [scopes, setScopes] = React.useState(["workspace", "wsl", "everything"]),
      [items, setItems] = React.useState([]),
      [searching, setSearching] = React.useState(false),
      [tabs, setTabs] = React.useState([]),
      [selected, setSelected] = React.useState(null),
      [error, setError] = React.useState(""),
      [notice, setNotice] = React.useState(""),
      [cap, setCap] = React.useState(null),
      [directory, setDirectory] = React.useState(null),
      [lastSearch, setLastSearch] = React.useState(null),
      [position, setPosition] = React.useState(null),
      [reload, setReload] = React.useState(0),
      [prefs, setPrefs] = React.useState(preferences),
      [page, setPage] = React.useState(0),
      [hasMore, setHasMore] = React.useState(false);
    const frameRef = React.useRef(null);
    const searchRun = React.useRef(0);
    const searchCache = React.useRef({
      base: "",
      cwd: "",
      pageSize: 0,
      pages: { workspace: {}, wsl: {}, everything: {} },
      hasMore: { workspace: true, wsl: true, everything: true },
    });
    const openTarget = React.useCallback(async (target) => {
      setOpen(true);
      setNotice("");
      if (!target) {
        setView("browse");
        return;
      }
      if (target.kind === "directory") {
        setView("browse");
        void browse(target.path);
        return;
      }
      const service = betterSidebar(),
        scope = currentScope(),
        path = target.sourcePath || target.path;
      let viewer = null;
      try {
        viewer = service?.matchFileViewer?.(path) || null;
      } catch {}
      const route = sidebarRouteEligibility({
        preferences,
        target,
        cwd: scope?.cwd,
        sidebarAvailable: Boolean(service?.openFile && scope),
        viewerMatched: Boolean(viewer),
      });
      if (route.eligible) {
        try {
          service.openFile(scope, path, target.name);
          setError("");
          return;
        } catch (error) {
          setError(
            `Better Sidebar 无法打开此文件，已改用 PeekFile：${error?.message || error}`,
          );
        }
      }
      if (
        route.reason === "outside-workspace" &&
        configuredPreviewChannel(preferences, target) === "sidebar"
      )
        setNotice("Sidebar只能预览工作目录内文件。");
      const previewLimit = Number(preferences.previewLimitMb) || 0;
      if (previewLimit > 0 && target.size > previewLimit * 1024 * 1024) {
        setError(`文件超过本地预览上限 ${previewLimit} MB`);
        return;
      }
      try {
        if (target.extension === "pdf") {
          const original = target,
            inspection = await api("inspect-pdf", {
              path: target.path,
              tools: preferences.tools,
            });
          target = inspection.previewTarget
            ? {
                ...inspection.previewTarget,
                name: original.name,
                sourcePath: original.path,
                originalExtension: "pdf",
                menuKind: "pdf-text",
                pdfKind: "text",
                pdfInspection: inspection,
              }
            : {
                ...original,
                pdfKind: inspection.kind === "image" ? "image" : "text",
                pdfInspection: inspection,
              };
          if (inspection.message) setNotice(inspection.message);
        } else if (
          [
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "odt",
            "ods",
            "odp",
            "rtf",
          ].includes(target.extension)
        ) {
          setError("正在转换 Office 文档…");
          target = {
            ...(await api("convert", {
              path: target.path,
              tools: preferences.tools,
            })),
            name: target.name,
            sourcePath: target.path,
            originalExtension: target.extension,
            menuKind: "office",
          };
        } else if (
          ["epub", "mobi", "azw", "azw3", "fb2"].includes(target.extension)
        ) {
          setError("正在准备电子书…");
          target = {
            ...(await api("ebook", {
              path: target.path,
              tools: preferences.tools,
            })),
            name: target.name,
            sourcePath: target.path,
            originalExtension: target.extension,
            menuKind: "ebook",
          };
        }
        setError("");
      } catch (e) {
        setError(e.message);
        return;
      }
      setTabs((old) =>
        old.some((x) => samePath(x, target)) ? old : [...old, target],
      );
      setSelected(target);
      setView("previewing");
    }, []);
    React.useEffect(() => {
      if (embedded) return;
      openPanel = openTarget;
      return () => {
        openPanel = () => {};
      };
    }, [embedded, openTarget]);
    React.useEffect(() => {
      if (!embedded) return;
      const receive = () => {
        const pending = sidebarPendingTarget;
        if (!pending || pending.panel !== panelKey) return;
        sidebarPendingTarget = null;
        void openTarget(pending.target);
      };
      receive();
      window.addEventListener("peekfile:sidebar-open", receive);
      return () => window.removeEventListener("peekfile:sidebar-open", receive);
    }, [embedded, openTarget, panelKey]);
    React.useEffect(() => {
      if (open)
        api("capability", { tools: preferences.tools })
          .then(setCap)
          .catch((e) => setError(e.message));
    }, [open]);
    React.useEffect(() => {
      const listener = (e) => setPrefs(e.detail);
      window.addEventListener("peekfile:settings", listener);
      return () => window.removeEventListener("peekfile:settings", listener);
    }, []);
    const cachedItems = (
      selectedScopes = scopes,
      pageIndex = page,
      filters = [],
    ) => {
      const cache = searchCache.current,
        seen = new Set(),
        output = [],
        pages = filters.length ? null : [pageIndex];
      for (const source of ["workspace", "wsl", "everything"]) {
        if (!selectedScopes.includes(source)) continue;
        const sourcePages = cache.pages[source] || {},
          values = pages
            ? pages.flatMap((index) => sourcePages[index] || [])
            : Object.keys(sourcePages)
                .sort((a, b) => a - b)
                .flatMap((index) => sourcePages[index] || []);
        for (const item of filterCachedSearchItems(values, filters)) {
          if (!seen.has(item.path)) {
            seen.add(item.path);
            output.push(item);
          }
        }
      }
      return output;
    };
    const showCached = (
      selectedScopes,
      pageIndex,
      filters,
      displayQuery = query,
    ) => {
      const next = cachedItems(selectedScopes, pageIndex, filters),
        more =
          !filters.length &&
          selectedScopes.some(
            (source) => searchCache.current.hasMore[source] !== false,
          );
      setItems(next);
      setPage(filters.length ? 0 : pageIndex);
      setHasMore(more);
      setLastSearch({
        query: displayQuery,
        items: next,
        page: filters.length ? 0 : pageIndex,
        hasMore: more,
        scopes: selectedScopes,
      });
      return next;
    };
    const search = async (
      nextPage = 0,
      nextQuery = query,
      nextScopes = scopes,
    ) => {
      const searchQuery = String(nextQuery).trim(),
        parsed = parseCachedSearchQuery(searchQuery),
        cwd = currentScope()?.cwd || "",
        run = ++searchRun.current;
      if (!parsed.base || !nextScopes.length) {
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        setError("");
        setShowHistory(false);
        setDirectory(null);
        setQuery(searchQuery);
        const cache = searchCache.current,
          isNew =
            cache.base !== parsed.base ||
            cache.cwd !== cwd ||
            cache.pageSize !== prefs.limit;
        if (isNew)
          searchCache.current = {
            base: parsed.base,
            cwd,
            pageSize: prefs.limit,
            pages: { workspace: {}, wsl: {}, everything: {} },
            hasMore: { workspace: true, wsl: true, everything: true },
          };
        const active = searchCache.current;
        if (parsed.filters.length) {
          showCached(nextScopes, 0, parsed.filters, searchQuery);
          return;
        }
        const missing = nextScopes.filter(
          (source) =>
            active.pages[source]?.[nextPage] === undefined &&
            active.hasMore[source] !== false,
        );
        if (missing.length) {
          const result = await api("search-page", {
            query: parsed.base,
            page: nextPage,
            pageSize: prefs.limit,
            cwd,
            scopes: missing,
            tools: preferences.tools,
          });
          for (const source of missing) {
            active.pages[source][nextPage] = result.bySource?.[source] || [];
            active.hasMore[source] = Boolean(result.sourceHasMore?.[source]);
          }
        }
        showCached(nextScopes, nextPage, [], searchQuery);
        if (isNew)
          setHistory((old) => {
            const next = updatedSearchHistory(old, searchQuery);
            localStorage.setItem(
              "peekfile:search-history",
              JSON.stringify(next),
            );
            return next;
          });
      } catch (e) {
        setError(e.message);
      } finally {
        if (run === searchRun.current) setSearching(false);
      }
    };
    const toggleScope = (source) => {
      const enabled = scopes.includes(source),
        next = enabled
          ? scopes.filter((value) => value !== source)
          : [...scopes, source].sort(
              (a, b) =>
                ["workspace", "wsl", "everything"].indexOf(a) -
                ["workspace", "wsl", "everything"].indexOf(b),
            );
      if (!next.length) return;
      setScopes(next);
      const parsed = parseCachedSearchQuery(query);
      if (
        !enabled &&
        parsed.base &&
        searchCache.current.base === parsed.base &&
        searchCache.current.pages[source]?.[page] === undefined
      )
        void search(page, query, next);
      else showCached(next, page, parsed.filters, query);
    };
    const changeSearchQuery = (value) => {
      setQuery(value);
      setShowHistory(true);
      const parsed = parseCachedSearchQuery(value);
      if (
        parsed.base &&
        parsed.base === searchCache.current.base &&
        parsed.filters.length
      )
        showCached(scopes, 0, parsed.filters, value);
      else if (
        parsed.base === searchCache.current.base &&
        !parsed.filters.length
      )
        showCached(scopes, page, [], value);
    };
    const clearSearchCache = () => {
      searchCache.current = {
        base: "",
        cwd: "",
        pageSize: 0,
        pages: { workspace: {}, wsl: {}, everything: {} },
        hasMore: { workspace: true, wsl: true, everything: true },
      };
      setItems([]);
      setLastSearch(null);
      setPage(0);
      setHasMore(false);
      setNotice("搜索临时缓存已清除");
      setShowScopes(false);
    };
    const browse = async (path) => {
      try {
        setError("");
        const result = await api("list", { path });
        setDirectory(result);
        setItems(result.items);
      } catch (e) {
        setError(e.message);
      }
    };
    const backToSearch = () => {
      if (!lastSearch) return;
      setError("");
      setDirectory(null);
      setQuery(lastSearch.query);
      setScopes(lastSearch.scopes || scopes);
      setItems(lastSearch.items);
      setPage(lastSearch.page);
      setHasMore(lastSearch.hasMore);
    };
    const activate = (item) =>
      item.kind === "directory"
        ? browse(item.path)
        : previewMenuKind(item) === "archive"
          ? api("open-system", { path: item.path }).catch((e) =>
              setError(e.message),
            )
          : openTarget(item);
    const closeTab = (item, event) => {
      event?.stopPropagation();
      setTabs((old) => {
        const next = old.filter((x) => !samePath(x, item));
        if (samePath(selected, item)) {
          const fallback = next.at(-1) || null;
          setSelected(fallback);
          if (!fallback) setView("browse");
        }
        return next;
      });
    };
    const saveAs = async () => {
      if (!selected) return;
      try {
        const handle = window.showSaveFilePicker
          ? await window.showSaveFilePicker({ suggestedName: selected.name })
          : null;
        const source = selected.sourcePath
            ? await api("resolve", { candidates: [selected.sourcePath] })
            : null,
          target = source?.items?.find((x) => x.ok)?.target || selected,
          rawUrl = new URL(target.previewUrl, location.href);
        rawUrl.searchParams.delete("render");
        rawUrl.searchParams.delete("player");
        const response = await fetch(rawUrl);
        if (!response.ok) throw new Error(`读取文件失败：${response.status}`);
        const blob = await response.blob();
        if (handle) {
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setNotice(`已另存为 ${handle.name}`);
        } else {
          const url = URL.createObjectURL(blob),
            anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = selected.name;
          anchor.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setNotice("浏览器不支持目录选择，已使用默认下载位置");
        }
        setError("");
      } catch (e) {
        if (e?.name !== "AbortError") setError(e.message);
      }
    };
    const detach = async () => {
      if (!selected) return;
      try {
        if (window.documentPictureInPicture?.requestWindow) {
          const pip = await window.documentPictureInPicture.requestWindow({
              width: 900,
              height: 650,
            }),
            frame = pip.document.createElement("iframe");
          frame.src = selected.previewUrl;
          frame.title = selected.name;
          Object.assign(frame.style, {
            position: "fixed",
            inset: "0",
            width: "100%",
            height: "100%",
            border: "0",
            background: "#fff",
          });
          pip.document.body.style.margin = "0";
          pip.document.body.appendChild(frame);
          return;
        }
        const popup = window.open(
          selected.previewUrl,
          "peekfile-preview",
          "popup,width=1000,height=720,resizable=yes,scrollbars=yes",
        );
        if (popup) return;
        setError("浏览器阻止了弹窗，已继续使用页面内浮窗");
      } catch {
        const popup = window.open(
          selected.previewUrl,
          "peekfile-preview",
          "popup,width=1000,height=720,resizable=yes,scrollbars=yes",
        );
        if (!popup) setError("PiP 与 Popup 均不可用，已继续使用页面内浮窗");
      }
    };
    const openSystem = async () => {
      if (!selected) return;
      try {
        await api("open-system", {
          path: selected.sourcePath || selected.path,
        });
      } catch (e) {
        setError(e.message);
      }
    };
    const appendContent = (text) => insertDraftText(text, "\n\n");
    const addPath = () => {
      const path = selected?.sourcePath || selected?.path;
      if (!path || !appendText(`@${path}`))
        setError("当前没有可用的对话输入框");
      else {
        setError("");
        setNotice("路径已添加到对话框");
      }
    };
    const copyAndAdd = async (text, label) => {
      if (!text?.trim()) throw new Error(`${label}为空`);
      if (!navigator.clipboard?.writeText)
        throw new Error("当前浏览器不允许写入剪贴板");
      await navigator.clipboard.writeText(text);
      if (!appendContent(text)) throw new Error("当前没有可用的对话输入框");
      setError("");
      setNotice(`${label}已复制并添加到对话框`);
    };
    const copyWhole = async () => {
      try {
        const result = await api("text", {
          path: selected?.sourcePath || selected?.path,
        });
        await copyAndAdd(result.text, "全文");
      } catch (e) {
        setError(e.message);
      }
    };
    const copySelection = async () => {
      try {
        const selection = frameRef.current?.contentDocument?.getSelection(),
          text = selection?.toString() || "";
        if (!text.trim()) throw new Error("请先在文本预览中选择内容");
        await copyAndAdd(text, "选取内容");
      } catch (e) {
        setError(e.message);
      }
    };
    const sendWholeMarkdown = async () => {
      try {
        setNotice("AnyDoc 正在生成全文 Markdown…");
        const target = await api("convert-markdown", {
          path: selected.sourcePath || selected.path,
          tools: preferences.tools,
        });
        if (!(await insertReference(target)))
          throw new Error("Markdown 文件未能加入当前会话框");
        setError("");
        setNotice("全文 Markdown 文件已加入会话框");
      } catch (e) {
        setError(e.message);
      }
    };
    const showFileInfo = () => {
      if (!selected) return;
      const size = Number(selected.size);
      setNotice(
        [
          selected.name,
          selected.extension ? `类型：${selected.extension}` : "",
          Number.isFinite(size)
            ? `大小：${(size / 1024 / 1024).toFixed(size > 1024 * 1024 ? 2 : 4)} MB`
            : "",
          selected.modifiedAt ? `修改时间：${selected.modifiedAt}` : "",
          `路径：${selected.sourcePath || selected.path}`,
        ]
          .filter(Boolean)
          .join(" · "),
      );
    };
    const originalTarget = async () => {
      if (!selected?.sourcePath) return selected;
      const result = await api("resolve", {
        candidates: [selected.sourcePath],
      });
      return result.items?.find((item) => item.ok)?.target || selected;
    };
    const selectedBlob = async () => {
      const target = await originalTarget(),
        response = await fetch(target.previewUrl);
      if (!response.ok) throw new Error(`读取文件失败：${response.status}`);
      return response.blob();
    };
    const attachImage = async (blob, name) => {
      const current = activeInput(),
        conversation = ctx.conversation;
      if (!current || typeof conversation?.createDraftImages !== "function")
        throw new Error("当前 DSH 会话不支持图片附件");
      const file = new File([blob], name, { type: blob.type || "image/png" }),
        images = conversation.createDraftImages([file]);
      if (!current.shell.addImages(images.map((image) => image.id))) {
        conversation.releaseDraftImages?.(images);
        throw new Error("当前会话正忙，图片未能插入");
      }
      return true;
    };
    const addOcrResult = async (result) => {
      const extracted = await api("text", { path: result.target.path });
      await copyAndAdd(extracted.text, "OCR 识别结果");
    };
    const mineruOcr = async () => {
      try {
        setNotice("MinerU 正在识别…");
        await addOcrResult(
          await api("mineru-ocr", {
            path: selected.sourcePath || selected.path,
            tools: preferences.tools,
          }),
        );
      } catch (e) {
        setError(e.message);
      }
    };
    const insertImage = async () => {
      try {
        await attachImage(await selectedBlob(), selected.name);
        setError("");
        setNotice("图片已插入会话");
      } catch (e) {
        setError(e.message);
      }
    };
    const captureBlob = async () => {
      const doc = frameRef.current?.contentDocument,
        source = doc?.querySelector("video,img,canvas");
      if (!source)
        throw new Error(
          "当前预览无法取得画面；PDF 页面截图需要可用的 PDF 页面渲染器",
        );
      const width = source.videoWidth || source.naturalWidth || source.width,
        height = source.videoHeight || source.naturalHeight || source.height;
      if (!width || !height) throw new Error("预览画面尚未加载完成");
      const scale = Math.min(1, 4096 / Math.max(width, height)),
        canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      canvas
        .getContext("2d")
        .drawImage(source, 0, 0, canvas.width, canvas.height);
      return new Promise((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("无法生成截图")),
          "image/png",
        ),
      );
    };
    const capturePlatform = /Windows/i.test(navigator.userAgent)
      ? "windows"
      : /Macintosh|Mac OS X/i.test(navigator.userAgent)
        ? "mac"
        : "other";
    const cropCapturedFrame = (stream) =>
      new Promise((resolveCrop, rejectCrop) => {
        const video = document.createElement("video"),
          overlay = document.createElement("div"),
          frame = document.createElement("canvas"),
          selection = document.createElement("div"),
          actions = document.createElement("div"),
          confirm = document.createElement("button"),
          cancel = document.createElement("button");
        overlay.className = "peekfile-crop-overlay";
        frame.className = "peekfile-crop-frame";
        selection.className = "peekfile-crop-selection";
        actions.className = "peekfile-crop-actions";
        confirm.textContent = "确定（Enter）";
        cancel.textContent = "取消（Esc）";
        actions.append(confirm, cancel);
        overlay.append(frame, selection, actions);
        document.body.append(overlay);
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        let rect = null,
          dragging = false,
          startX = 0,
          startY = 0,
          ready = false;
        const stop = () => stream.getTracks().forEach((track) => track.stop()),
          cleanup = () => {
            overlay.remove();
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", up);
            document.removeEventListener("keydown", key);
            stop();
          },
          view = () => {
            const scale = Math.min(
                innerWidth / frame.width,
                innerHeight / frame.height,
              ),
              width = frame.width * scale,
              height = frame.height * scale;
            return {
              left: (innerWidth - width) / 2,
              top: (innerHeight - height) / 2,
              width,
              height,
              scale,
            };
          },
          down = (e) => {
            if (!ready || actions.contains(e.target)) return;
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            selection.style.display = "block";
            Object.assign(selection.style, {
              left: `${startX}px`,
              top: `${startY}px`,
              width: "0px",
              height: "0px",
            });
            e.preventDefault();
          },
          move = (e) => {
            if (!dragging) return;
            Object.assign(selection.style, {
              left: `${Math.min(startX, e.clientX)}px`,
              top: `${Math.min(startY, e.clientY)}px`,
              width: `${Math.abs(e.clientX - startX)}px`,
              height: `${Math.abs(e.clientY - startY)}px`,
            });
          },
          up = (e) => {
            if (!dragging) return;
            dragging = false;
            rect = {
              x: Math.min(startX, e.clientX),
              y: Math.min(startY, e.clientY),
              w: Math.abs(e.clientX - startX),
              h: Math.abs(e.clientY - startY),
            };
          },
          finish = () => {
            if (!ready) return;
            const vr = view();
            let sx = 0,
              sy = 0,
              sw = frame.width,
              sh = frame.height;
            if (rect && rect.w >= 4 && rect.h >= 4) {
              sx = Math.max(0, (rect.x - vr.left) / vr.scale);
              sy = Math.max(0, (rect.y - vr.top) / vr.scale);
              sw = Math.min(rect.w / vr.scale, frame.width - sx);
              sh = Math.min(rect.h / vr.scale, frame.height - sy);
            }
            if (sw <= 0 || sh <= 0) return;
            const output = document.createElement("canvas");
            output.width = Math.max(1, Math.round(sw));
            output.height = Math.max(1, Math.round(sh));
            output
              .getContext("2d")
              .drawImage(
                frame,
                sx,
                sy,
                sw,
                sh,
                0,
                0,
                output.width,
                output.height,
              );
            output.toBlob((blob) => {
              cleanup();
              blob
                ? resolveCrop(blob)
                : rejectCrop(new Error("画框截图导出失败"));
            }, "image/png");
          },
          abort = () => {
            cleanup();
            resolveCrop(null);
          },
          key = (e) => {
            if (e.key === "Escape") abort();
            else if (e.key === "Enter") finish();
          };
        overlay.addEventListener("mousedown", down);
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", up);
        document.addEventListener("keydown", key);
        confirm.onclick = finish;
        cancel.onclick = abort;
        video.onloadedmetadata = () =>
          video
            .play()
            .then(() => new Promise((done) => requestAnimationFrame(done)))
            .then(() => {
              frame.width = video.videoWidth;
              frame.height = video.videoHeight;
              frame.getContext("2d").drawImage(video, 0, 0);
              video.pause();
              ready = true;
            })
            .catch((error) => {
              cleanup();
              rejectCrop(error);
            });
        video.play().catch(() => {});
      });
    const pausePreviewMedia = () => {
      try {
        const media =
          frameRef.current?.contentDocument?.querySelectorAll("video,audio") ||
          [];
        media.forEach((item) => item.pause());
      } catch {}
    };
    const directPreviewCapture = () => {
      try {
        const source =
          frameRef.current?.contentDocument?.querySelector("video,img,canvas");
        if (!source) return null;
        const width = source.videoWidth || source.naturalWidth || source.width,
          height = source.videoHeight || source.naturalHeight || source.height;
        if (!width || !height) return null;
        const frame = document.createElement("canvas");
        frame.width = width;
        frame.height = height;
        frame.getContext("2d").drawImage(source, 0, 0, width, height);
        const stream = frame.captureStream?.(1);
        return stream ? cropCapturedFrame(stream) : null;
      } catch {
        return null;
      }
    };
    const captureAdapters = {
      windows: async () => {
        if (!navigator.mediaDevices?.getDisplayMedia)
          throw new Error("当前浏览器不支持屏幕捕获");
        const constraints = {
          video: { displaySurface: "browser" },
          audio: false,
          preferCurrentTab: true,
          selfBrowserSurface: "include",
          monitorTypeSurfaces: "exclude",
          surfaceSwitching: "exclude",
        };
        let controller;
        try {
          if (typeof CaptureController !== "undefined") {
            controller = new CaptureController();
            controller.setFocusBehavior?.("no-focus-change");
          }
        } catch {}
        const stream = controller
          ? await navigator.mediaDevices.getDisplayMedia(
              constraints,
              controller,
            )
          : await navigator.mediaDevices.getDisplayMedia(constraints);
        return cropCapturedFrame(stream);
      },
      mac: async () => {
        throw new Error("macOS 画框截图接口已保留，当前版本未启用");
      },
      other: async () => {
        throw new Error("当前平台暂未启用画框截图");
      },
    };
    const captureRegion = () => {
      pausePreviewMedia();
      return directPreviewCapture() || captureAdapters[capturePlatform]();
    };
    const regionToChat = async () => {
      try {
        setNotice("请选择当前 DSH 标签页或窗口，然后拖框…");
        const blob = await captureRegion();
        if (!blob) {
          setNotice("已取消画框截图");
          return;
        }
        await attachImage(blob, `${selected.name}-region.png`);
        setError("");
        setNotice("选区截图已插入会话");
      } catch (e) {
        setError(e.message);
      }
    };
    const regionOcr = async () => {
      try {
        setNotice("请选择当前 DSH 标签页或窗口，然后拖框…");
        const blob = await captureRegion();
        if (!blob) {
          setNotice("已取消画框 OCR");
          return;
        }
        const response = await fetch("/__peekfile/mineru-ocr-upload", {
            method: "POST",
            headers: {
              "content-type": "image/png",
              "x-peekfile-name": encodeURIComponent(
                `${selected.name}-region.png`,
              ),
              "x-peekfile-tools": encodeURIComponent(
                JSON.stringify(preferences.tools),
              ),
            },
            body: blob,
          }),
          result = await response.json();
        if (!result.ok) throw new Error(result.error || "MinerU OCR 失败");
        await addOcrResult(result.value);
      } catch (e) {
        setError(e.message);
      }
    };
    const screenshotOcr = async () => {
      try {
        setNotice("正在截取当前 PDF 页面…");
        const blob = await captureBlob(),
          response = await fetch("/__peekfile/mineru-ocr-upload", {
            method: "POST",
            headers: {
              "content-type": "image/png",
              "x-peekfile-name": encodeURIComponent(
                `${selected.name}-page.png`,
              ),
              "x-peekfile-tools": encodeURIComponent(
                JSON.stringify(preferences.tools),
              ),
            },
            body: blob,
          }),
          result = await response.json();
        if (!result.ok) throw new Error(result.error || "MinerU OCR 失败");
        setNotice("MinerU 正在识别当前页…");
        await addOcrResult(result.value);
      } catch (e) {
        setError(e.message);
      }
    };
    const saveBlob = async (blob, name) => {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({ suggestedName: name }),
          writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return handle.name;
      }
      const url = URL.createObjectURL(blob),
        anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return name;
    };
    const screenshotToChat = async () => {
      try {
        await attachImage(
          await captureBlob(),
          `${selected.name}-screenshot.png`,
        );
        setError("");
        setNotice("截图已插入会话");
      } catch (e) {
        setError(e.message);
      }
    };
    const screenshotSave = async () => {
      try {
        const name = await saveBlob(
          await captureBlob(),
          `${selected.name}-screenshot.png`,
        );
        setError("");
        setNotice(`截图已另存为 ${name}`);
      } catch (e) {
        if (e?.name !== "AbortError") setError(e.message);
      }
    };
    const transcodeMp4 = async (replyWindow) => {
      const reply =
          replyWindow && typeof replyWindow.postMessage === "function"
            ? replyWindow
            : null,
        source = selected?.sourcePath || selected?.path;
      if (!source) return;
      try {
        setError("");
        setNotice("视频转换中…");
        reply?.postMessage(
          { type: "peekfile:transcode-status", status: "loading" },
          location.origin,
        );
        const target = await api("transcode-mp4", {
          path: source,
          tools: preferences.tools,
        });
        reply?.postMessage(
          {
            type: "peekfile:transcode-status",
            status: "success",
            previewUrl: target.previewUrl,
          },
          location.origin,
        );
        await openTarget(target);
        setNotice("MP4 转换成功，已自动打开播放");
      } catch (e) {
        reply?.postMessage(
          {
            type: "peekfile:transcode-status",
            status: "error",
            message: e.message,
          },
          location.origin,
        );
        setError(e.message);
        setNotice("");
      }
    };
    React.useEffect(() => {
      const receive = (event) => {
        if (
          event.origin !== location.origin ||
          event.data?.type !== "peekfile:transcode-video"
        )
          return;
        if (previewMenuKind(selected) !== "video") return;
        void transcodeMp4(event.source);
      };
      window.addEventListener("message", receive);
      return () => window.removeEventListener("message", receive);
    }, [selected]);
    const openSubtitles = async () => {
      try {
        const result = await api("subtitles", {
          path: selected.sourcePath || selected.path,
        });
        if (!result.items?.length) throw new Error("同目录未找到同名字幕文件");
        await openTarget(result.items[0]);
        setNotice(
          result.items.length > 1
            ? `找到 ${result.items.length} 个字幕，已打开第一个`
            : "字幕已打开",
        );
      } catch (e) {
        setError(e.message);
      }
    };
    const dragStart = (e) => {
      if (e.target.closest("input,button,.peekfile-scope-menu")) return;
      const panel = e.currentTarget.closest(".peekfile-panel");
      if (!panel || panel.classList.contains("peekfile-embedded")) return;
      const rect = panel.getBoundingClientRect(),
        sx = e.clientX,
        sy = e.clientY;
      const move = (ev) =>
        setPosition({
          left: rect.left + ev.clientX - sx,
          top: rect.top + ev.clientY - sy,
        });
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
    const selectedMenu = selected ? previewMenuKind(selected) : "other";
    const btn = (label, onClick) =>
        h("button", { className: "peekfile-btn", onClick }, label),
      back = () => btn("← 文件列表", () => setView("browse"));
    const toolbar = () => {
      if (!selected) return null;
      const path = () => btn("@路径", addPath),
        save = () => btn("另存为", saveAs),
        close = () =>
          embedded ? null : btn("关闭", () => setOpen(false)),
        system = (label = "系统打开") => btn(label, openSystem),
        region = () =>
          capturePlatform === "windows"
            ? h(
                React.Fragment,
                null,
                btn("画框截图", regionToChat),
                btn("画框OCR", regionOcr),
              )
            : null;
      if (selectedMenu === "text")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("复制全文", copyWhole),
          btn("复制选取", copySelection),
          btn("信息", showFileInfo),
          btn("弹出", detach),
          system(),
          btn("刷新", () => setReload((x) => x + 1)),
          save(),
          close(),
        );
      if (selectedMenu === "image")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("插入会话", insertImage),
          btn("文本识别", mineruOcr),
          btn("弹出", detach),
          system(),
          save(),
          close(),
        );
      if (selectedMenu === "video")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("截图插入会话", screenshotToChat),
          btn("截图另存", screenshotSave),
          btn("转MP4", () => transcodeMp4()),
          btn("字幕", openSubtitles),
          btn("弹出", detach),
          system("播放器打开"),
          save(),
          close(),
        );
      if (selectedMenu === "audio")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("弹出", detach),
          system("播放器打开"),
          save(),
          close(),
        );
      if (selectedMenu === "pdf-image")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("截图插入会话", screenshotToChat),
          btn("截图OCR", screenshotOcr),
          system(),
          save(),
          close(),
        );
      if (selectedMenu === "pdf-text")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("选取复制", copySelection),
          btn("全文发送", sendWholeMarkdown),
          system(),
          save(),
          close(),
        );
      if (selectedMenu === "office")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("选取复制", copySelection),
          btn("全文发送", sendWholeMarkdown),
          system(),
          save(),
          close(),
        );
      if (selectedMenu === "ebook")
        return h(
          React.Fragment,
          null,
          back(),
          path(),
          region(),
          btn("选取复制", copySelection),
          system(),
          save(),
          close(),
        );
      return h(
        React.Fragment,
        null,
        back(),
        path(),
        system(),
        save(),
        close(),
      );
    };
    if (!open) return null;
    return h(
      "div",
      {
        className: `peekfile-panel peekfile-${view}${embedded ? " peekfile-embedded" : ""}`,
        style:
          !embedded && position
            ? {
                left: Math.max(0, position.left),
                top: Math.max(0, position.top),
                right: "auto",
              }
            : undefined,
      },
      view === "browse"
        ? h(
            React.Fragment,
            null,
            h(
              "div",
              {
                className: "peekfile-bar",
                onPointerDown: embedded ? undefined : dragStart,
              },
              h(
                "div",
                { className: "peekfile-searchbox" },
                h("input", {
                  className: "peekfile-input",
                  value: query,
                  placeholder:
                    cap?.everything === false
                      ? "搜索工作目录或 WSL 文件"
                      : "搜索本地文件",
                  disabled: !prefs.search,
                  onFocus: () => setShowHistory(true),
                  onBlur: () => setTimeout(() => setShowHistory(false), 120),
                  onChange: (e) => changeSearchQuery(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") void search();
                  },
                }),
                showHistory && history.length
                  ? h(
                      "div",
                      { className: "peekfile-history" },
                      history.map((value) =>
                        h(
                          "button",
                          {
                            className: "peekfile-history-item",
                            key: value,
                            onPointerDown: (e) => e.preventDefault(),
                            onClick: () => void search(0, value),
                          },
                          h(
                            "span",
                            { className: "peekfile-history-icon" },
                            "↺",
                          ),
                          h(
                            "span",
                            { className: "peekfile-history-text" },
                            value,
                          ),
                        ),
                      ),
                    )
                  : null,
              ),
              h(
                "button",
                {
                  className: "peekfile-btn",
                  onClick: () => search(),
                  disabled: !prefs.search || searching,
                },
                searching ? "搜索中…" : "搜索",
              ),
              h(
                "div",
                { className: "peekfile-scopes" },
                h(
                  "button",
                  {
                    className: "peekfile-btn",
                    title: "选择搜索范围",
                    onClick: () => setShowScopes((value) => !value),
                  },
                  `范围 ${scopes.length}/3 ▾`,
                ),
                showScopes
                  ? h(
                      "div",
                      { className: "peekfile-scope-menu" },
                      [
                        ["workspace", "工作目录"],
                        ["wsl", "WSL"],
                        ["everything", "Everything"],
                      ].map(([source, label]) =>
                        h(
                          "label",
                          {
                            className: `peekfile-scope-option peekfile-scope-${source}`,
                            key: source,
                          },
                          h("input", {
                            type: "checkbox",
                            checked: scopes.includes(source),
                            disabled:
                              source === "everything" &&
                              cap?.everything === false,
                            onChange: () => toggleScope(source),
                          }),
                          h("span", null, label),
                        ),
                      ),
                      h(
                        "div",
                        { className: "peekfile-cache-note" },
                        "仅缓存于内存；新搜索时自动清除",
                      ),
                      h(
                        "button",
                        {
                          className: "peekfile-btn peekfile-cache-clear",
                          onClick: clearSearchCache,
                        },
                        "清除当前缓存",
                      ),
                    )
                  : null,
              ),
              directory && lastSearch
                ? h(
                    "button",
                    {
                      className: "peekfile-btn",
                      onClick: backToSearch,
                      title: "返回本次搜索列表",
                    },
                    "返回",
                  )
                : null,
              !embedded
                ? h(
                    "button",
                    {
                      className: "peekfile-btn",
                      onClick: () => setOpen(false),
                    },
                    "关闭",
                  )
                : null,
            ),
            !searching && items.length
              ? h(
                  "div",
                  { className: "peekfile-listhead" },
                  h("span", null, "名称"),
                  h("span", null, "类型"),
                  h("span", null, "上级目录"),
                  h("span", null, "命中原因"),
                  h("span", null, ""),
                )
              : null,
          )
        : null,
      error ? h("div", { className: "peekfile-error" }, error) : null,
      h(
        "div",
        { className: "peekfile-body" },
        view === "browse"
          ? h(
              "div",
              { className: "peekfile-results" },
              searching
                ? h("div", { className: "peekfile-empty" }, "搜索中…")
                : items.length
                  ? items.map((item) => {
                      const kind = previewMenuKind(item),
                        archive = kind === "archive";
                      return h(
                        "div",
                        {
                          className: `peekfile-row peekfile-tone-${fileTone(item)}${item.source ? ` peekfile-source-${item.source}` : ""}${samePath(selected, item) ? " active" : ""}`,
                          key: item.path,
                          onClick: () => activate(item),
                        },
                        h(
                          "span",
                          { className: "peekfile-name" },
                          item.kind === "directory" ? "📁 " : "📄 ",
                          item.name,
                        ),
                        h(
                          "span",
                          { className: "peekfile-type" },
                          item.extension || "文件夹",
                        ),
                        h(
                          "span",
                          {
                            className: `peekfile-path${!directory ? " peekfile-parent" : ""}`,
                            title: item.parent,
                            onClick: !directory
                              ? (e) => {
                                  e.stopPropagation();
                                  browse(item.parent);
                                }
                              : undefined,
                          },
                          item.parent,
                        ),
                        item.reason && !directory
                          ? h(
                              "span",
                              {
                                className: "peekfile-reason",
                                title: `${item.source === "workspace" ? "工作目录" : item.source === "wsl" ? "WSL" : "Everything"} 命中：${item.reason}`,
                              },
                              item.reason,
                            )
                          : h("span", null, ""),
                        h(
                          "button",
                          {
                            className: "peekfile-btn",
                            title: archive ? "系统打开" : "添加到对话",
                            onClick: (e) => {
                              e.stopPropagation();
                              if (archive)
                                void api("open-system", {
                                  path: item.path,
                                }).catch((error) => setError(error.message));
                              else if (
                                item.kind === "directory" ||
                                isLinePreview(item)
                              )
                                void insertReference(item);
                              else if (!appendText(`@${item.path}`))
                                setError("当前没有可用的对话输入框");
                            },
                          },
                          archive ? "打开" : "@",
                        ),
                      );
                    })
                  : h(
                      "div",
                      { className: "peekfile-empty" },
                      query ? "没有找到匹配文件" : "输入关键词开始搜索",
                    ),
            )
          : null,
        view === "previewing"
          ? h(
              "div",
              { className: "peekfile-preview" },
              h(
                "div",
                {
                  className: "peekfile-tabs",
                  onPointerDown: embedded ? undefined : dragStart,
                },
                tabs.map((tab) =>
                  h(
                    "div",
                    {
                      className: `peekfile-tab${samePath(selected, tab) ? " active" : ""}`,
                      key: tab.path,
                      onClick: () => {
                        setSelected(tab);
                        setView("previewing");
                      },
                      onAuxClick: (e) => e.button === 1 && closeTab(tab, e),
                    },
                    h(
                      "span",
                      { className: "peekfile-tab-name", title: tab.path },
                      tab.name,
                    ),
                    h(
                      "span",
                      {
                        className: "peekfile-tab-x",
                        onPointerDown: (e) => e.stopPropagation(),
                        onClick: (e) => closeTab(tab, e),
                      },
                      "×",
                    ),
                  ),
                ),
                notice
                  ? h(
                      "span",
                      { className: "peekfile-tab-notice", title: notice },
                      notice,
                    )
                  : null,
              ),
              selected
                ? h(
                    React.Fragment,
                    null,
                    h(
                      "div",
                      {
                        className: "peekfile-previewbar",
                        onPointerDown: embedded ? undefined : dragStart,
                      },
                      toolbar(),
                    ),
                    h("iframe", {
                      ref: frameRef,
                      key: reload,
                      className: "peekfile-frame",
                      src: selected.previewUrl,
                      title: selected.name,
                    }),
                  )
                : h("div", { className: "peekfile-empty" }, "选择文件进行预览"),
            )
          : null,
      ),
      view === "browse"
        ? h(
            "div",
            { className: "peekfile-footer" },
            h(
              "div",
              { className: "peekfile-footer-controls" },
              h(
                React.Fragment,
                null,
                `第 ${page + 1} 页 · ${directory ? items.length : lastSearch?.items.length || items.length} 项`,
                h(
                  "button",
                  {
                    className: "peekfile-btn",
                    disabled: !!directory || page === 0,
                    onClick: () => search(page - 1),
                  },
                  "上一页",
                ),
                h(
                  "button",
                  {
                    className: "peekfile-btn",
                    disabled: !!directory || !hasMore,
                    onClick: () => search(page + 1),
                  },
                  "下一页",
                ),
              ),
              directory
                ? h(
                    "button",
                    {
                      className: "peekfile-btn",
                      onClick: () => browse(directory.parent),
                      title: "上级目录",
                    },
                    "↑ 上级",
                  )
                : null,
            ),
            directory
              ? h(
                  "span",
                  { className: "peekfile-footer-path", title: directory.path },
                  directory.path,
                )
              : cap?.everything === false
                ? h(
                    "span",
                    { className: "peekfile-footer-path" },
                    "Everything 不可用；工作目录与 WSL 搜索仍可使用",
                  )
                : null,
          )
        : null,
    );
  }
  ctx.effect(() => {
    let registeredService = null,
      disposeTab = null;
    const sync = () => {
      const service = betterSidebar();
      if (service === registeredService) return;
      disposeTab?.();
      disposeTab = null;
      registeredService = service || null;
      if (!service?.registerTab) return;
      try {
        disposeTab = service.registerTab({
          id: "peekfile:browser",
          title: "PeekFile",
          icon: searchIcon,
          order: 35,
          dedupeKey: (tab) =>
            tab.meta?.peekfilePanel ||
            (tab.id.endsWith(":bottom") ? "bottom" : "side"),
          createTab: (state) => {
            const panel = peekfilePanelOf(state);
            return {
              tab: {
                id: `peekfile:browser:${panel}`,
                type: "peekfile:browser",
                title: "PeekFile",
                meta: { peekfilePanel: panel },
              },
            };
          },
          component: (props) =>
            h(Panel, {
              embedded: true,
              initialOpen: true,
              visible: props.visible,
              panelKey:
                props.tab.meta?.peekfilePanel ||
                (props.tab.id.endsWith(":bottom") ? "bottom" : "side"),
            }),
        });
      } catch (error) {
        console.warn(
          "[peekfile] Better Sidebar tab registration failed:",
          error,
        );
      }
    };
    sync();
    const timer = setInterval(sync, 1500);
    return () => {
      clearInterval(timer);
      disposeTab?.();
    };
  });
  slots.inject("conversation.session.header.utilities", () =>
    slots.register(
      {
        name: "conversation.session.header.utilities",
        id: "peekfile-button",
        label: "PeekFile",
        order: 9,
      },
      Button,
    ),
  );
  slots.inject("shell.overlay", () =>
    slots.register(
      { name: "shell.overlay", id: "peekfile-panel", order: 9 },
      Panel,
    ),
  );
  function SettingsCard() {
    const [value, setValue] = React.useState(preferences),
      [status, setStatus] = React.useState({}),
      [checking, setChecking] = React.useState(false),
      [section, setSection] = React.useState("general");
    const change = (key, next) => {
      const merged = { ...value, [key]: next };
      setValue(merged);
      savePreferences(merged);
    };
    const changeFamily = (key, next) =>
      change("previewFamilyRoutes", {
        ...value.previewFamilyRoutes,
        [key]: next,
      });
    const changeTool = (key, patch) =>
      change("tools", {
        ...value.tools,
        [key]: { ...value.tools[key], ...patch },
      });
    const check = async () => {
      setChecking(true);
      try {
        setStatus(await api("tool-status", { tools: value.tools }));
      } finally {
        setChecking(false);
      }
    };
    React.useEffect(() => {
      void check();
    }, []);
    const sidebarReady = Boolean(betterSidebar()),
      badge = (key) => {
        const item = status[key];
        return h(
          "span",
          { className: `peekfile-tool-status ${item?.ok ? "ok" : "missing"}` },
          !item
            ? "未检测"
            : item.disabled
              ? "已停用"
              : item.ok
                ? "可用"
                : "缺失",
        );
      };
    const tool = (key, label, pathField, description, install, extra) =>
      h(
        "div",
        { className: "peekfile-tool", key },
        h(
          "div",
          { className: "peekfile-tool-head" },
          h("input", {
            type: "checkbox",
            checked: value.tools[key].enabled,
            onChange: (e) => changeTool(key, { enabled: e.target.checked }),
          }),
          h("strong", null, label),
          badge(key),
        ),
        h("input", {
          className: "peekfile-tool-path",
          value: value.tools[key][pathField],
          onChange: (e) => changeTool(key, { [pathField]: e.target.value }),
        }),
        extra,
        h("div", { className: "peekfile-setting-note" }, `用途：${description}`),
        h("div", { className: "peekfile-setting-note" }, `安装：${install}`),
        h(
          "div",
          { className: "peekfile-setting-note" },
          status[key]?.version || status[key]?.error || "尚未检测",
        ),
      );
    const tabs = h(
      "div",
      { className: "peekfile-settings-tabs" },
      [
        ["general", "常规与预览"],
        ["tools", "外挂工具"],
        ["mineru", "MinerU OCR"],
      ].map(([key, label]) =>
        h(
          "button",
          {
            key,
            className: `peekfile-settings-tab${section === key ? " active" : ""}`,
            onClick: () => setSection(key),
          },
          label,
        ),
      ),
    );
    const general = h(
      React.Fragment,
      null,
      h("h3", null, "界面、搜索与预览"),
      h(
        "div",
        { className: "peekfile-settings-group" },
        h(
          "label",
          { className: "peekfile-setting" },
          h("span", null, "界面位置"),
          h(
            "select",
            {
              value: value.surfaceMode,
              onChange: (e) => change("surfaceMode", e.target.value),
            },
            h("option", { value: "floating" }, "浮动窗口"),
            h(
              "option",
              { value: "sidebar", disabled: !sidebarReady },
              "Better Sidebar",
            ),
          ),
        ),
        !sidebarReady
          ? h(
              "span",
              { className: "peekfile-setting-note" },
              "未检测到 Better Sidebar，侧边栏模式将自动回退浮动窗口。",
            )
          : null,
        h(
          "label",
          { className: "peekfile-setting" },
          h("span", null, "预览处理"),
          h(
            "select",
            {
              value: value.previewRoutingMode,
              onChange: (e) => change("previewRoutingMode", e.target.value),
            },
            h("option", { value: "peekfile-first" }, "PeekFile"),
            h("option", { value: "custom" }, "按文件类型自定义"),
          ),
        ),
        value.previewRoutingMode === "custom"
          ? h(
              "div",
              { className: "peekfile-settings-group" },
              previewFamilies.map(([key, label]) =>
                h(
                  "label",
                  { className: "peekfile-setting", key },
                  h("span", null, label),
                  h(
                    "select",
                    {
                      value: value.previewFamilyRoutes?.[key] || "peekfile",
                      onChange: (e) => changeFamily(key, e.target.value),
                    },
                    h("option", { value: "peekfile" }, "PeekFile"),
                    h(
                      "option",
                      { value: "sidebar", disabled: !sidebarReady },
                      "Better Sidebar",
                    ),
                  ),
                ),
              ),
            )
          : null,
      ),
      h("h3", null, "搜索与路径"),
      h(
        "div",
        { className: "peekfile-settings-group" },
        [
          ["search", "启用文件搜索"],
          ["autoLink", "自动链接对话本地路径"],
          ["codePaths", "识别代码块中的路径"],
          ["drops", "允许拖入非图片文件"],
        ].map(([key, label]) =>
          h(
            "label",
            { className: "peekfile-setting", key },
            h("span", null, label),
            h("input", {
              type: "checkbox",
              checked: value[key],
              onChange: (e) => change(key, e.target.checked),
            }),
          ),
        ),
        h(
          "label",
          { className: "peekfile-setting" },
          h("span", null, "每来源每页上限"),
          h(
            "select",
            {
              value: value.limit,
              onChange: (e) => change("limit", Number(e.target.value)),
            },
            [10, 25, 50, 100].map((n) => h("option", { key: n, value: n }, n)),
          ),
        ),
        h(
          "label",
          { className: "peekfile-setting" },
          h("span", null, "本地预览上限（MB，0 为不限制）"),
          h("input", {
            type: "number",
            min: 0,
            value: value.previewLimitMb,
            onChange: (e) =>
              change(
                "previewLimitMb",
                Math.max(0, Number(e.target.value) || 0),
              ),
          }),
        ),
        h(
          "label",
          { className: "peekfile-setting" },
          h("span", null, "拖入对话框上限（MB）"),
          h("input", {
            type: "number",
            min: 1,
            value: value.dropLimitMb,
            onChange: (e) =>
              change("dropLimitMb", Math.max(1, Number(e.target.value) || 10)),
          }),
        ),
      ),
    );
    const tools = h(
      React.Fragment,
      null,
      h("h3", null, "外挂工具"),
      h(
        "button",
        { className: "peekfile-btn", disabled: checking, onClick: check },
        checking ? "检测中…" : "重新检测全部工具",
      ),
      h(
        "div",
        { className: "peekfile-settings-group" },
        tool(
          "ffmpeg",
          "FFmpeg",
          "path",
          "读取视频画面、截图，并把 MKV、AVI、WMV、RMVB 等浏览器不支持的视频转为 MP4。",
          "Ubuntu/WSL：sudo apt install ffmpeg",
        ),
        tool(
          "anydoc",
          "AnyDoc",
          "path",
          "从 PDF 和 Office 文档提取全文，生成 Markdown 后添加到会话。",
          "npm install -g @firecrawl/anydoc",
        ),
        tool(
          "officecli",
          "OfficeCLI",
          "path",
          "把 Word、Excel、PowerPoint 等 Office 文件转换为可在浏览器中选字和预览的 HTML。",
          "npm install -g @officecli/officecli",
        ),
        tool(
          "pdfInspector",
          "PDF Inspector",
          "detectPath",
          "判断 PDF 是文本、混合还是全图类型；pdf2md 作为 PDF 文本提取的备用通道。",
          "cargo install pdf-inspector --locked（同时确认 detect-pdf 与 pdf2md 路径）",
          h("input", {
            className: "peekfile-tool-path",
            value: value.tools.pdfInspector.convertPath,
            onChange: (e) =>
              changeTool("pdfInspector", { convertPath: e.target.value }),
            placeholder: "pdf2md 路径",
          }),
        ),
        tool(
          "ebookConvert",
          "Calibre ebook-convert",
          "path",
          "把 MOBI、AZW、AZW3、FB2 等电子书转换为 EPUB，再交给 PeekFile 阅读器。",
          "Ubuntu/WSL：sudo apt install calibre",
        ),
        tool(
          "unzip",
          "Unzip",
          "path",
          "解包 EPUB，供 PeekFile 读取书名、目录、章节、图片和样式资源。",
          "Ubuntu/WSL：sudo apt install unzip",
        ),
        tool(
          "everything",
          "Everything CLI",
          "path",
          "调用 Windows Everything 索引，快速搜索 Windows 磁盘中的文件。",
          "Windows 安装 Everything 与 ES 命令行工具，然后在此填写 WSL 可调用的 es 路径。",
        ),
        tool(
          "ripgrep",
          "ripgrep",
          "path",
          "枚举并筛选当前工作目录及 WSL 内部文件，提供本地搜索通道。",
          "Ubuntu/WSL：sudo apt install ripgrep",
        ),
      ),
    );
    const mineru = h(
      React.Fragment,
      null,
      h("h3", null, "MinerU OCR"),
      h(
        "div",
        { className: "peekfile-tool" },
        h(
          "div",
          { className: "peekfile-tool-head" },
          h("input", {
            type: "checkbox",
            checked: value.tools.mineru.enabled,
            onChange: (e) =>
              changeTool("mineru", { enabled: e.target.checked }),
          }),
          h("strong", null, "MinerU"),
          badge("mineru"),
        ),
        h(
          "div",
          { className: "peekfile-setting-note" },
          "用途：识别图片、截图和全图 PDF 中的文字、表格与公式，并把识别结果加入会话。",
        ),
        h(
          "div",
          { className: "peekfile-setting-note" },
          "启用：在 MinerU 平台申请 API Token，将 Token 保存为本地文本文件，并在下方填写 API 地址与 Token 文件路径。",
        ),
        h("input", {
          className: "peekfile-tool-path",
          value: value.tools.mineru.endpoint,
          onChange: (e) => changeTool("mineru", { endpoint: e.target.value }),
          placeholder: "API 地址",
        }),
        h("input", {
          className: "peekfile-tool-path",
          value: value.tools.mineru.tokenPath,
          onChange: (e) => changeTool("mineru", { tokenPath: e.target.value }),
          placeholder: "Token 文件路径",
        }),
        h(
          "div",
          { className: "peekfile-tool-grid" },
          h(
            "select",
            {
              value: value.tools.mineru.modelVersion,
              onChange: (e) =>
                changeTool("mineru", { modelVersion: e.target.value }),
            },
            h("option", { value: "vlm" }, "VLM"),
            h("option", { value: "pipeline" }, "Pipeline"),
          ),
          h("input", {
            value: value.tools.mineru.language,
            onChange: (e) => changeTool("mineru", { language: e.target.value }),
            placeholder: "语言 ch",
          }),
          h("input", {
            value: value.tools.mineru.pageRanges,
            onChange: (e) =>
              changeTool("mineru", { pageRanges: e.target.value }),
            placeholder: "页码范围，如 1-10",
          }),
          h("input", {
            type: "number",
            min: 30,
            value: value.tools.mineru.timeoutSeconds,
            onChange: (e) =>
              changeTool("mineru", {
                timeoutSeconds: Math.max(30, Number(e.target.value) || 600),
              }),
          }),
        ),
        h(
          "label",
          { className: "peekfile-setting" },
          h("span", null, "表格识别"),
          h("input", {
            type: "checkbox",
            checked: value.tools.mineru.enableTable,
            onChange: (e) =>
              changeTool("mineru", { enableTable: e.target.checked }),
          }),
        ),
        h(
          "label",
          { className: "peekfile-setting" },
          h("span", null, "公式识别"),
          h("input", {
            type: "checkbox",
            checked: value.tools.mineru.enableFormula,
            onChange: (e) =>
              changeTool("mineru", { enableFormula: e.target.checked }),
          }),
        ),
      ),
    );
    return h(
      "div",
      { className: "peekfile-settings" },
      h("h2", null, "PeekFile"),
      h(
        "div",
        { className: "peekfile-setting-note" },
        "原 WebUI 插件中的 PeekFile 参数已统一迁移到这里，并继续沿用现有保存值。",
      ),
      tabs,
      section === "general" ? general : section === "tools" ? tools : mineru,
    );
  }
  slots.inject("settings.section", () =>
    slots.register(
      {
        name: "settings.section",
        id: "peekfile",
        label: "PeekFile",
        order: 115,
      },
      SettingsCard,
    ),
  );
  ctx.effect(() => {
    const re =
      /(?<![\w@.])(?:[A-Za-z]:[\\/][^\n<>"'`]+?|(?:\/home\/|\/mnt\/|~\/)[^\n<>"'`]+?\.[A-Za-z0-9]{1,12})(?=[\s),;]|$)/g;
    const process = async (root) => {
      if (!preferences.autoLink || !root?.isConnected) return;
      const nodes = [],
        walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const excluded = preferences.codePaths
          ? ".peekfile-panel,a,input,textarea,[contenteditable=true]"
          : ".peekfile-panel,a,pre,code,input,textarea,[contenteditable=true]";
        if (node.parentElement?.closest(excluded)) continue;
        const matches = node.nodeValue?.match(re);
        if (matches) nodes.push([node, [...new Set(matches)]]);
      }
      for (const [textNode, candidates] of nodes) {
        const result = await api("resolve", { candidates }).catch(() => null);
        if (!result) continue;
        const hit = result.items.find((x) => x.ok);
        if (
          !hit ||
          !textNode.isConnected ||
          !textNode.nodeValue.includes(hit.candidate)
        )
          continue;
        const parts = textNode.nodeValue.split(hit.candidate),
          fragment = document.createDocumentFragment();
        parts.forEach((part, i) => {
          fragment.append(part);
          if (i < parts.length - 1) {
            const link = document.createElement("a");
            link.className = "peekfile-link";
            link.textContent = hit.candidate;
            link.href = hit.target.previewUrl;
            link.onclick = (e) => {
              e.preventDefault();
              openSurface(hit.target);
            };
            fragment.append(link);
          }
        });
        textNode.replaceWith(fragment);
      }
    };
    const observer = new MutationObserver((records) =>
      records.forEach((record) =>
        record.addedNodes.forEach(
          (node) => node.nodeType === 1 && process(node),
        ),
      ),
    );
    observer.observe(document.body, { childList: true, subtree: true });
    void process(document.body);
    return () => observer.disconnect();
  });
  ctx.effect(() => {
    const onDragOver = (event) => {
      if (!preferences.drops) return;
      const files = [...(event.dataTransfer?.files || [])];
      if (files.some((file) => !file.type.startsWith("image/")))
        event.preventDefault();
    };
    const onDrop = async (event) => {
      if (!preferences.drops) return;
      const files = [...(event.dataTransfer?.files || [])];
      if (!files.some((file) => !file.type.startsWith("image/"))) return;
      event.preventDefault();
      const current = activeInput();
      if (!current?.cwd) return;
      const dropLimit = Math.max(1, Number(preferences.dropLimitMb) || 10);
      for (const file of files) {
        if (file.size > dropLimit * 1024 * 1024) {
          console.warn(`[peekfile] ${file.name} 超过拖入上限 ${dropLimit} MB`);
          continue;
        }
        try {
          const response = await fetch("/__peekfile/upload", {
              method: "POST",
              headers: {
                "x-peekfile-root": encodeURIComponent(current.cwd),
                "x-peekfile-name": encodeURIComponent(file.name),
                "x-peekfile-limit-mb": String(dropLimit),
                "content-type": file.type || "application/octet-stream",
              },
              body: file,
            }),
            result = await response.json();
          if (result.ok) await insertReference(result.value);
        } catch (error) {
          console.warn("[peekfile] drop upload failed", error);
        }
      }
    };
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  });
}
