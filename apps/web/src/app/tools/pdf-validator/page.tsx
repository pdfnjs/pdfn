"use client";

import { useState, useCallback } from "react";
import { Header, Footer } from "@/components";

type Status = "idle" | "ready" | "uploading" | "done";

interface Issue {
  rule: string;
  title: string;
  description: string;
  category: string;
  count: number;
  docsUrl: string;
}

interface Result {
  compliant: boolean;
  profile: string;
  details: {
    passedRules: number;
    failedRules: number;
    passedChecks: number;
    failedChecks: number;
  };
  issues: Issue[];
  summary: Record<string, number>;
  meta: {
    fileSize: number;
    fileName: string;
    durationMs: number;
  };
}

// Ordered by popularity within each category
const PROFILE_GROUPS = [
  {
    label: "PDF/A — Archival",
    options: [
      { value: "2b", label: "PDF/A-2b" },  // Most common modern standard
      { value: "1b", label: "PDF/A-1b" },  // Legacy but widely used
      { value: "3b", label: "PDF/A-3b" },  // Growing (allows attachments)
      { value: "2a", label: "PDF/A-2a" },
      { value: "1a", label: "PDF/A-1a" },
      { value: "2u", label: "PDF/A-2u" },
      { value: "3a", label: "PDF/A-3a" },
      { value: "4", label: "PDF/A-4" },    // Newest, limited adoption
    ],
  },
  {
    label: "PDF/UA — Accessibility",
    options: [
      { value: "ua1", label: "PDF/UA-1" }, // Widely adopted
      { value: "ua2", label: "PDF/UA-2" }, // Very new (2024)
    ],
  },
  {
    label: "Other",
    options: [
      { value: "auto", label: "Auto (from PDF metadata)" },
    ],
  },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function PDFValidatorPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [profile, setProfile] = useState("2b");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const selectFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.includes("pdf")) {
      setError("Please select a PDF file");
      return;
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File must be under 100 MB");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setStatus("ready");
  }, []);

  const validate = useCallback(async () => {
    if (!file) return;

    setStatus("uploading");
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`https://api.pdfn.dev/v1/validate?profile=${profile}`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Validation failed");
      }

      setResult(await res.json());
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("done");
    }
  }, [file, profile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) selectFile(droppedFile);
  }, [selectFile]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) selectFile(selectedFile);
  }, [selectFile]);

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setFile(null);
  };

  const showUploadSection = status === "idle" || status === "ready";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Upload Section - idle and ready states */}
        {showUploadSection && (
          <div className="w-full max-w-xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              PDF Validator
            </h1>
            <p className="text-text-secondary mb-8">
              Check PDF/A archival and PDF/UA accessibility compliance
            </p>

            {/* Card Area - Upload Zone or File Card */}
            {status === "idle" ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                className={`
                  relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer
                  ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-text-muted"}
                `}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-1 flex items-center justify-center">
                    <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">
                      Drop your PDF here
                    </p>
                    <p className="text-text-muted text-sm mt-1">
                      or click to browse &middot; max 100 MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative border-2 border-border rounded-2xl p-12">
                <button
                  onClick={reset}
                  className="absolute top-4 right-4 text-text-muted hover:text-red-400 p-1 transition-colors"
                  aria-label="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">{file?.name}</p>
                    <p className="text-text-muted text-sm mt-1">{file ? formatSize(file.size) : ""}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Row - always same height */}
            <div className="mt-6 h-12 flex items-center justify-center gap-3">
              {status === "ready" && (
                <>
                  <select
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    className="bg-surface-1 border border-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary min-w-[180px]"
                  >
                    {PROFILE_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    onClick={validate}
                    className="px-8 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-xl transition-colors"
                  >
                    Validate
                  </button>
                </>
              )}
            </div>

            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}

            {/* Privacy notice */}
            <p className="mt-6 text-text-secondary text-sm">
              Files are not stored on our servers
            </p>
          </div>
        )}

        {/* Loading State */}
        {status === "uploading" && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <p className="text-text-secondary">Validating compliance...</p>
            {file && (
              <p className="text-text-muted text-sm mt-2">
                {file.name} ({formatSize(file.size)})
              </p>
            )}
          </div>
        )}

        {/* Results State */}
        {status === "done" && (
          <div className="w-full max-w-2xl">
            {/* Error State */}
            {error && file && (
              <>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-red-400 mb-1">Validation Failed</h2>
                  <p className="text-text-secondary">{error}</p>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-text-muted mb-8">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {file.name}
                  </span>
                  <span>{formatSize(file.size)}</span>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={validate}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-surface-1 hover:bg-surface-2 text-text-primary border border-border rounded-xl transition-colors"
                  >
                    Choose Different File
                  </button>
                </div>
              </>
            )}

            {/* Success State */}
            {result && (
              <>
                <div className="text-center mb-8">
                  {result.compliant ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-green-400 mb-1">Compliant</h2>
                      <p className="text-text-secondary">
                        Your PDF meets {result.profile.replace(" validation profile", "")} standards
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-amber-400 mb-1">Not Compliant</h2>
                      <p className="text-text-secondary">
                        Does not meet {result.profile.replace(" validation profile", "")} standards
                      </p>
                      <p className="text-text-muted text-sm mt-1">
                        {result.issues.length} issue{result.issues.length !== 1 ? "s" : ""} found
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-text-muted mb-8">
                  <span>{result.meta.fileName}</span>
                  <span>{formatSize(result.meta.fileSize)}</span>
                  <span>{result.meta.durationMs}ms</span>
                </div>

                {result.issues.length > 0 && (
                  <div className="bg-surface-1 rounded-xl border border-border overflow-hidden mb-8">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-medium text-text-primary">Issues to Fix</h3>
                      <span className="text-xs text-text-muted">
                        {result.details.failedRules} rules failed
                      </span>
                    </div>
                    <div className="divide-y divide-border max-h-96 overflow-y-auto">
                      {result.issues.map((issue, i) => (
                        <div key={i} className="px-5 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-text-primary text-sm">
                                {issue.title}
                                {issue.count > 1 && (
                                  <span className="ml-2 text-xs text-amber-400">×{issue.count}</span>
                                )}
                              </h4>
                              <p className="text-text-secondary text-sm mt-1">
                                {issue.description}
                              </p>
                            </div>
                            {issue.docsUrl && (
                              <a
                                href={issue.docsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline whitespace-nowrap"
                              >
                                Learn more
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.compliant && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-surface-1 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{result.details.passedRules}</div>
                      <div className="text-xs text-text-muted">Rules Passed</div>
                    </div>
                    <div className="bg-surface-1 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{result.details.passedChecks}</div>
                      <div className="text-xs text-text-muted">Checks Passed</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-semibold rounded-xl transition-colors"
                  >
                    Check Another PDF
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* FAQ Section - shown in idle and ready states */}
      {showUploadSection && (
        <section className="border-t border-border py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="sr-only">About PDF Validation</h2>
            <div className="grid md:grid-cols-3 gap-8 text-sm">
              <div>
                <h3 className="font-medium text-text-primary mb-2">What is PDF/A?</h3>
                <p className="text-text-secondary">
                  An ISO standard for long-term archiving. Ensures PDFs remain readable for years
                  by embedding fonts and metadata.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-2">What is PDF/UA?</h3>
                <p className="text-text-secondary">
                  Universal Accessibility standard. Ensures PDFs are accessible to people using
                  screen readers and assistive technologies.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-2">Which should I use?</h3>
                <p className="text-text-secondary">
                  <strong>PDF/A-2b</strong> for archival. <strong>PDF/UA-1</strong> for accessibility.
                  Use both if you need archival + accessible documents.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
