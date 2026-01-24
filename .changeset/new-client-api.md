---
"@pdfn/react": minor
---

Add pdfn() client factory with improved developer experience

- New `pdfn()` factory function with smart defaults (local dev vs cloud)
- Typed `PdfnError` with codes and actionable suggestions
- `{ data, error }` response pattern (no try/catch needed)
- Renamed `host` to `baseUrl` for consistency
- Updated documentation
