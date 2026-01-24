# Error Handling

pdfn uses a `{ data, error }` pattern. No try/catch needed.

## Basic Pattern

```typescript
const { data, error } = await client.generate(<Invoice />);

if (error) {
  console.error(error.code, error.message);
  return;
}

// Success - use data.buffer
```

## Error Object

```typescript
interface PdfnError {
  code: string;        // Machine-readable code
  message: string;     // Human-readable message
  suggestion?: string; // How to fix it
  statusCode?: number; // HTTP status (if applicable)
}
```

## Error Codes

| Code | Cause | Solution |
|------|-------|----------|
| `configuration_error` | Missing server config | Run `npx pdfn dev` or set `PDFN_API_KEY` |
| `authentication_error` | Invalid API key | Check your `PDFN_API_KEY` |
| `validation_error` | Invalid input | Check your template/options |
| `rate_limit_error` | Too many requests | Slow down or upgrade plan |
| `timeout_error` | Generation took too long | Simplify template |
| `network_error` | Can't reach server | Check connection, run `npx pdfn dev` |
| `render_error` | React render failed | Check component for errors |
| `server_error` | Server-side error | Retry or contact support |

## Examples

### Log with suggestion

```typescript
const { data, error } = await client.generate(<Invoice />);

if (error) {
  console.error(`[${error.code}] ${error.message}`);
  if (error.suggestion) {
    console.error(`Fix: ${error.suggestion}`);
  }
  return;
}
```

### HTTP response

```typescript
export async function GET() {
  const { data, error } = await client.generate(<Invoice />);

  if (error) {
    return Response.json(
      { error: error.code, message: error.message },
      { status: error.statusCode || 500 }
    );
  }

  return new Response(data.buffer, {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
```

### TypeScript type guard

```typescript
import { PdfnError } from '@pdfn/react';

function isRateLimit(error: PdfnError): boolean {
  return error.code === 'rate_limit_error';
}
```

## Common Issues

### "Cannot connect to pdfn server"

```
[network_error] Cannot connect to pdfn server at http://localhost:3456
```

**Fix:** Start the dev server:

```bash
npx pdfn dev
```

### "Invalid API key"

```
[authentication_error] Invalid API key
```

**Fix:** Check your environment variable:

```bash
echo $PDFN_API_KEY
```

### "PDF generation timed out"

```
[timeout_error] PDF generation timed out
```

**Fix:** Simplify your template or increase timeout:

```typescript
const client = pdfn({
  timeout: 60000, // 60 seconds
});
```
