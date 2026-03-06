# pdfn

Dev server and CLI for pdfn. Run with `npx` — no install needed.

## Commands

### `pdfn dev`

Start dev server with live preview:

```bash
npx pdfn dev           # Start on port 3456
npx pdfn dev --open    # Open browser automatically
```

Options:

| Flag | Default | Description |
|------|---------|-------------|
| `--port` | `3456` | Port for the dev server |
| `--open` | — | Open browser automatically |
| `--mode` | — | Load additional `.env.[mode]` files |

### `pdfn add`

Add templates to your project:

```bash
npx pdfn add invoice            # Add invoice template
npx pdfn add invoice --tailwind # With Tailwind classes
npx pdfn add --list             # List available templates
```

Templates: `invoice`, `letter`, `contract`, `ticket`, `poster`, `report`

## Usage

```typescript
import { pdfn } from '@pdfn/react';
import Invoice from './pdfn-templates/invoice';

// Local dev (uses localhost:3456)
const client = pdfn();

// Or pdfn Cloud
// const client = pdfn(process.env.PDFN_API_KEY);

const { data, error } = await client.generate({ react: <Invoice /> });

if (error) {
  console.error(error.message);
  return;
}

// Use data.buffer
```

## Requirements

- Node.js 22+

## License

MIT
