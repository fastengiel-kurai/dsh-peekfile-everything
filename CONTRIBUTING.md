# Contributing

## Development setup

Requirements: Node.js 22 or newer, pnpm, and a working DSH Web profile.

```bash
git clone https://github.com/fastengiel-kurai/dsh-peekfile-everything.git
cd dsh-peekfile-everything
pnpm install
pnpm test
pnpm build
```

For local DSH testing:

```bash
dsh plugin --profile web add .
```

Restart DSH after changing the Host half. Hard-refresh the browser after rebuilding the client.

## Pull requests

- Keep each change focused and describe user-visible behavior.
- Add or update tests for shared search, routing, classification, or operation-menu logic.
- Run `pnpm test`, `pnpm build`, `node --check src/client.js`, and `node --check src/host.js`.
- Do not commit `lib/`, caches, generated preview files, `.env` files, tokens, private documents, or machine-specific paths.
- Document new external executables, network endpoints, file writes, defaults, and uninstall steps.

## Security

Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Never use public pull requests to demonstrate a live exploit or publish credentials.
