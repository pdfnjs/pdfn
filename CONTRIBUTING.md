# Contributing to pdfn

Thank you for your interest in contributing to pdfn! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Getting Help](#getting-help)

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great together.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 10+ (`npm install -g pnpm`)
- Git

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/pdfnjs/pdfn.git
cd pdfn

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development mode
pnpm dev
```

## Development Setup

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages |
| `pnpm dev` | Start all packages in watch mode |
| `pnpm test` | Run tests |
| `pnpm lint` | Run linting |
| `pnpm check-types` | Type check all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Clean build artifacts |

### Running the Dev Server

To test changes to the CLI or React components:

```bash
# Terminal 1: Watch mode for packages
pnpm dev

# Terminal 2: Run the dev server (in packages/cli)
cd packages/cli
pnpm dev
```

This opens the preview UI at `http://localhost:3456` with hot reload.

## Project Structure

```
pdfn/
├── packages/
│   ├── react/          # @pdfn/react - Core components
│   │   ├── src/
│   │   │   ├── components/   # Document, Page, PageNumber, etc.
│   │   │   ├── render.ts     # React → HTML
│   │   │   └── generate.ts   # React → PDF (via server)
│   │   └── package.json
│   │
│   ├── tailwind/       # @pdfn/tailwind - Tailwind CSS support
│   │   ├── src/
│   │   │   ├── Tailwind.tsx  # <Tailwind> wrapper component
│   │   │   └── process.ts    # CSS processing
│   │   └── package.json
│   │
│   ├── cli/            # pdfn - CLI and dev server
│   │   ├── src/
│   │   │   ├── cli.ts        # Command definitions
│   │   │   ├── server/       # Dev server with Puppeteer
│   │   │   └── templates/    # Starter templates
│   │   └── package.json
│   │
│   ├── next/           # @pdfn/next - Next.js integration
│   ├── vite/           # @pdfn/vite - Vite integration
│   ├── core/           # Internal utilities
│   └── client/         # Client-side utilities
│
├── apps/
│   └── web/            # Demo website (pdfn.dev)
│
├── docs/               # Documentation
└── references/         # Internal specs (not published)
```

### Package Dependencies

```
@pdfn/react (core, no heavy deps)
    ↓
@pdfn/tailwind (optional, adds Tailwind v4)
    ↓
@pdfn/next / @pdfn/vite (optional, build plugins)

pdfn CLI (dev tool, includes Puppeteer)
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feat/your-feature
# or
git checkout -b fix/your-bugfix
```

Branch naming conventions:
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Your Changes

- Keep changes focused and atomic
- Follow existing code patterns
- Add tests for new functionality
- Update documentation if needed

### 3. Create a Changeset

We use [changesets](https://github.com/changesets/changesets) for versioning:

```bash
pnpm changeset
```

Select the packages you changed and describe your changes:
- `patch` - Bug fixes, minor changes
- `minor` - New features (backwards compatible)
- `major` - Breaking changes

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(react): add watermark support to Page component"
git commit -m "fix(cli): handle spaces in template paths"
git commit -m "docs: add troubleshooting section"
```

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Pull Request Process

1. **Push your branch:**
   ```bash
   git push origin feat/your-feature
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template:**
   - What does this PR do?
   - How to test?
   - Screenshots (if UI changes)

4. **Wait for review** - We aim to review within 48 hours

5. **Address feedback** and push updates

6. **Merge!** - We squash merge to keep history clean

### PR Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Types check (`pnpm check-types`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Changeset added (if applicable)
- [ ] Documentation updated (if applicable)

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Export types for public APIs
- Avoid `any` - use `unknown` if needed
- Document complex types with JSDoc

### React Components

- Use functional components
- Export prop types
- Use sensible defaults
- Keep components focused

```tsx
// Good
export interface PageProps {
  size?: PageSize;
  margin?: string | MarginObject;
  children: React.ReactNode;
}

export function Page({ size = 'A4', margin = '1in', children }: PageProps) {
  // ...
}
```

### File Organization

- One component per file
- Name files after the primary export
- Group related utilities

### Error Messages

Write helpful error messages with actionable next steps:

```typescript
// Good
throw new Error(
  `Invalid page size "${size}". ` +
  `Use: A4, A3, A5, Letter, Legal, Tabloid, B4, B5, ` +
  `or [width, height] in CSS units.`
);

// Avoid
throw new Error('Invalid size');
```

## Testing

### Running Tests

```bash
# All tests
pnpm test

# Specific package
cd packages/react
pnpm test

# Watch mode
pnpm test:watch
```

### Writing Tests

- Test public APIs
- Include edge cases
- Use descriptive test names

```typescript
describe('Page', () => {
  it('renders with default A4 size', () => {
    // ...
  });

  it('accepts custom dimensions as [width, height]', () => {
    // ...
  });

  it('throws for invalid size values', () => {
    // ...
  });
});
```

## Documentation

### Where to Document

- **README.md** - Quick start, overview
- **docs/** - Detailed guides
- **JSDoc** - API documentation in code
- **Code comments** - Complex logic explanation

### Documentation Style

- Use clear, concise language
- Include code examples
- Show expected output
- Link to related docs

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/pdfnjs/pdfn/discussions)
- **Found a bug?** Open an [Issue](https://github.com/pdfnjs/pdfn/issues)
- **Feature idea?** Open a [Feature Request](https://github.com/pdfnjs/pdfn/issues/new?template=feature_request.yml)

## Recognition

Contributors are recognized in release notes and the README. Thank you for helping make pdfn better!

---

**Ready to contribute?** Pick an issue labeled [`good first issue`](https://github.com/pdfnjs/pdfn/labels/good%20first%20issue) and dive in!
