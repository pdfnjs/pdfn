---
"@pdfn/react": patch
---

Auto-read PDFN_API_KEY from environment variable

`pdfn()` now automatically reads the `PDFN_API_KEY` environment variable. If set, it connects to pdfn Cloud. If not set, it falls back to localhost:3456 for local development.
