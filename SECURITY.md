# Security Policy

## Supported versions

PeekFile is currently pre-1.0. Security fixes target the latest commit on `main` and the latest published tag, when a tag exists. Older commits are not maintained as separate security release lines.

## Private reporting

Do not disclose a suspected vulnerability in a public issue. Use GitHub's [private vulnerability reporting form](https://github.com/fastengiel-kurai/dsh-peekfile-everything/security/advisories/new).

Include the affected PeekFile and DSH versions or commits, operating system, a minimal reproduction without real credentials or private documents, expected impact, and any known workaround.

Do not attach API tokens, private keys, personal files, or unredacted logs. If the private form is unavailable, open a public issue containing no exploit details and ask the maintainer for a private contact channel.

## Data boundary

PeekFile reads local files selected through search, browsing, path links, or preview actions. Optional MinerU OCR uploads only the file or captured region selected by the user to the configured MinerU endpoint. The MinerU token is read by the Host from a user-selected local file and must never be committed to this repository.
