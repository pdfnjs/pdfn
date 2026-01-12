---
"@pdfn/next": minor
"@pdfn/react": patch
---

Add debug overlay support for client templates and fix serverless deployment

**@pdfn/next:**
- Fix bundle manifest loading on Vercel serverless (use static imports)
- Fix Tailwind CSS loading on Vercel serverless (use static imports)
- Add debug overlay support for renderTemplate()
- Fix cache check for client templates (report template)

**@pdfn/react:**
- Re-export DebugOptions from @pdfn/core
- Use shared debug utilities from @pdfn/core

Note: @pdfn/core and @pdfn/client are new packages published at 0.1.0
