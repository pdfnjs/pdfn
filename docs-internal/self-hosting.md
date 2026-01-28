# Self-Hosting

Run PDF generation on your own infrastructure using Puppeteer or Playwright.

> **Note:** Self-hosted pdfn is community-supported. For production workloads with SLA guarantees and PDF/A compliance, use [pdfn Cloud](https://console.pdfn.dev).

## How It Works

```
React Component → render() → HTML → Puppeteer → PDF
```

1. `render()` converts React to self-contained HTML (no server needed)
2. You run Chromium to convert HTML to PDF

## Puppeteer Setup

### Installation

```bash
npm install @pdfn/react puppeteer
```

### Generate PDF

```typescript
import { pdfn } from '@pdfn/react';
import puppeteer from 'puppeteer';
import fs from 'fs';
import Invoice from './templates/invoice';

const client = pdfn();

// 1. Render to HTML
const { data, error } = await client.render({ react: <Invoice /> });

if (error) {
  console.error(error.message);
  return;
}

// 2. Convert to PDF with Puppeteer
const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.setContent(data.html, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => window.PDFN?.ready === true);

const pdf = await page.pdf({
  preferCSSPageSize: true,
  printBackground: true,
});

await browser.close();

// 3. Use the PDF buffer
fs.writeFileSync('invoice.pdf', pdf);
```

## Playwright Setup

### Installation

```bash
npm install @pdfn/react playwright
```

### Generate PDF

```typescript
import { pdfn } from '@pdfn/react';
import { chromium } from 'playwright';
import Invoice from './templates/invoice';

const client = pdfn();

const { data, error } = await client.render({ react: <Invoice /> });

if (error) {
  console.error(error.message);
  return;
}

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setContent(data.html, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.PDFN?.ready === true);

const pdf = await page.pdf({
  preferCSSPageSize: true,
  printBackground: true,
});

await browser.close();
```

## Docker Setup

### Dockerfile

```dockerfile
FROM node:20-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "server.js"]
```

### Server Example

```typescript
// server.js
import express from 'express';
import { pdfn } from '@pdfn/react';
import puppeteer from 'puppeteer';
import Invoice from './templates/invoice.js';

const app = express();
const client = pdfn();

let browser;

app.post('/pdf', async (req, res) => {
  const { data, error } = await client.render({ react: <Invoice data={req.body} /> });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  const page = await browser.newPage();
  await page.setContent(data.html, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window.PDFN?.ready === true);

  const pdf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
  });

  await page.close();

  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdf);
});

app.listen(3000);
```

## Important Notes

### Wait for Ready

Always wait for pdfn to signal readiness:

```typescript
await page.waitForFunction(() => window.PDFN?.ready === true);
```

This ensures fonts are loaded and pagination is complete.

### PDF Options

Always use these options for correct output:

```typescript
await page.pdf({
  preferCSSPageSize: true,  // Use @page size from CSS
  printBackground: true,    // Include background colors
});
```

### Browser Reuse

For production, reuse the browser instance:

```typescript
// Create once
const browser = await puppeteer.launch();

// Reuse for each PDF
const page = await browser.newPage();
// ... generate PDF
await page.close(); // Close page, not browser
```

## Comparison

| Feature | Self-Hosted | pdfn Cloud |
|---------|-------------|------------|
| Setup | You manage Chromium | Zero config |
| Scaling | You handle it | Auto-scales |
| PDF/A | Not available | Available |
| Cost | Your infrastructure | Pay per PDF |

Use self-hosting for:
- Full control over infrastructure
- Data residency requirements
- High volume with existing Chromium setup

Use pdfn Cloud for:
- Zero infrastructure management
- PDF/A compliance
- Automatic scaling

## Custom Server

If you run your own pdfn-compatible server:

```typescript
// Custom server (no auth)
const client = pdfn({ baseUrl: 'https://my-pdfn-server.com' });

// Custom server with auth (API key sent to your server)
const client = pdfn({
  baseUrl: 'https://my-pdfn-server.com',
  apiKey: process.env.MY_API_KEY,
});
```

This allows you to use a custom authentication layer with your self-hosted server.
