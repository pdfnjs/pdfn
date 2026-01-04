import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-text-muted">pdf</span>
            <span className="text-primary">n</span>
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center px-6" style={{ minHeight: "calc(100vh - 73px)" }}>
        <div className="max-w-md w-full text-center">
          <p className="text-8xl font-bold text-primary mb-4">404</p>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Page not found
          </h1>
          <p className="text-text-secondary mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-primary text-background font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              Go home
            </Link>
            <Link
              href="/templates"
              className="px-6 py-3 border border-border text-text-secondary font-medium rounded-lg hover:border-primary/50 hover:text-text-primary transition-colors"
            >
              View templates
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
