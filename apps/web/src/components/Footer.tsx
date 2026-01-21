import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span>Open source</span>
          <span className="hidden sm:inline">·</span>
          <span>MIT</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="https://github.com/pdfnjs/pdfn#quick-start"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/pdfnjs/pdfn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/pdfnjs/pdfn/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-secondary transition-colors"
          >
            Discussions
          </a>
          <Link
            href="/cloud"
            className="hover:text-text-secondary transition-colors"
          >
            Cloud
          </Link>
        </div>
      </div>
    </footer>
  );
}
