"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

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
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Something went wrong
          </h1>
          <p className="text-text-secondary mb-8">
            An unexpected error occurred. Please try again.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary text-background font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-border text-text-secondary font-medium rounded-lg hover:border-primary/50 hover:text-text-primary transition-colors"
            >
              Go home
            </Link>
          </div>
          {error.digest && (
            <p className="mt-8 text-xs text-text-muted">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
