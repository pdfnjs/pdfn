---
"pdfn": patch
---

Fix @pdfn/tailwind detection for all package managers

The `pdfn add --tailwind` command now correctly detects @pdfn/tailwind by checking both package.json dependencies and node_modules directory. This fixes issues with npm, pnpm, yarn, and monorepo setups.
