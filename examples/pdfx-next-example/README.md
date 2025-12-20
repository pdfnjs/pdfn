# PDFX + Next.js Example

Generate PDFs from React components using PDFX in a Next.js application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Start the PDFX server (in a separate terminal):
```bash
npx pdfx serve
```

4. Start the Next.js dev server:
```bash
npm run dev
```

5. Open http://localhost:3000 and click "Generate PDF"

## Project Structure

```
src/app/
├── page.tsx           # Home page with PDF generation buttons
└── api/pdf/
    └── route.tsx      # API route that generates the PDF
```

## How It Works

The API route (`/api/pdf`) uses `@pdfx-dev/react` to:

1. Define a PDF template using React components
2. Call `generate()` which renders the React to HTML
3. Sends the HTML to the PDFX server (running on port 3456)
4. Returns the PDF as a response

```tsx
import { generate, Document, Page } from '@pdfx-dev/react';

export async function GET() {
  const pdf = await generate(
    <Document>
      <Page size="A4">
        <h1>Hello World</h1>
      </Page>
    </Document>
  );

  return new Response(pdf, {
    headers: { 'Content-Type': 'application/pdf' }
  });
}
```

## Important

PDFX is **server-only**. The `generate()` function can only be used in:
- API routes (like this example)
- Server Actions
- Server Components

Do NOT import `@pdfx-dev/react` in files marked with `"use client"`.
