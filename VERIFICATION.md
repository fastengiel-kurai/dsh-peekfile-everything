# Verification

Last verified: 2026-08-22

## Environment

- DSH: `0.1.0-rc.8`
- DSH mainline commit: `141eb6fef83422698aef7a981029e843e8161534`
- OS: Windows 11 with WSL2 Ubuntu 24.04
- Node.js requirement: `>= 22`
- Optional Better Sidebar tested version: `0.14.0`

## Checks

```bash
node --test tests/*.test.js
node build.mjs
node --check src/client.js
node --check src/host.js
git diff --check
```

Expected result: all 17 Node tests pass, the bundle is generated under `lib/`, and both syntax checks exit successfully.

## Runtime smoke test

The plugin was loaded in the DSH `web` profile and exercised through the PeekFiles entry. The smoke path covered opening the search window, searching local sources, opening a file preview, and loading the PeekFile settings page.

This verification is compatibility evidence for the listed environment, not a security audit or a guarantee for every optional executable and file format.
