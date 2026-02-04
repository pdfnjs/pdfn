---
"@pdfn/core": minor
"pdfn": minor
---

Add PreviewProps pattern for template preview data (React Email pattern)

- Templates now use a static `PreviewProps` property for dev preview sample data
- Fix: `getDefaultExportName()` now handles separated export patterns (`function X() {} ... export default X`)
- Fix: Template detection now supports arrow function components
- All starter templates updated to use PreviewProps pattern
