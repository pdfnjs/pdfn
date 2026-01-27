import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-8">
          {/* Logo and tagline */}
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-text-primary">pdf</span>
              <span className="text-primary">n</span>
            </Link>
            <span className="text-text-muted">·</span>
            <span className="text-sm text-text-muted">MIT License</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a
              href="https://pdfn.dev/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Docs
            </a>
            <Link
              href="/templates"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/tools/pdf-validator"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              PDF Validator
            </Link>
            <a
              href="https://github.com/pdfnjs/pdfn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/pdfnjs/pdfn/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Discussions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
