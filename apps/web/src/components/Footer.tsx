export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-sm text-text-muted">
        <span>Open source</span>
        <span>·</span>
        <span>MIT</span>
        <span>·</span>
        <a
          href="https://github.com/pdfnjs/pdfn"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-text-secondary transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
