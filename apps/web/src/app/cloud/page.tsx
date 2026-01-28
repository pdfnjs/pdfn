import { Header, Footer } from "@/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "pdfn Cloud - Managed PDF Generation",
  description:
    "Managed PDF generation for invoices, contracts, and compliance documents. Same templates, same layout, less operational burden.",
  openGraph: {
    title: "pdfn Cloud - Managed PDF Generation",
    description:
      "Managed PDF generation for invoices, contracts, and compliance documents. Same templates, same layout, less operational burden.",
  },
};

export default function CloudPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-24 md:py-32 px-6 hero-glow overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6 animate-fade-in">
            <span>Early Access</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4 leading-tight animate-fade-in">
            <span className="text-text-primary">pdf</span>
            <span className="text-primary">n</span> Cloud
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto animate-fade-in-delay-1">
            Managed PDF generation for invoices, contracts, and compliance documents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <a
              href="https://console.pdfn.dev/waitlist"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            >
              Request early access
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="https://pdfn.dev/docs"
              className="flex items-center gap-2 bg-surface-1 border border-border hover:border-border-hover rounded-xl px-6 py-3 font-medium text-text-primary transition-all hover:bg-surface-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Why Cloud exists */}
      <section className="py-20 md:py-28 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
            Why Cloud exists
          </h2>
          <p className="text-xl text-text-secondary text-center max-w-2xl mx-auto mb-12">
            pdfn is fully usable as open source. Cloud exists to handle the parts teams repeatedly told us they don&apos;t want to own.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                ),
                title: "Managed infrastructure",
                desc: "No Chromium to maintain, no Docker, no memory issues"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Scales automatically",
                desc: "Pre-warmed instances, handles traffic spikes"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "PDF/A compliance",
                desc: "Archival standards for regulated industries"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Built-in validation",
                desc: "Ensures every PDF is valid and complete"
              },
            ].map((item, i) => (
              <div key={i} className="card-hover bg-surface-2 border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 text-primary">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                </div>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://console.pdfn.dev/waitlist"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors"
            >
              Request early access
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* What Cloud does NOT do - Trust building */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
            What Cloud does NOT do
          </h2>
          <p className="text-xl text-text-secondary text-center max-w-2xl mx-auto mb-12">
            We believe in open source. Cloud is optional infrastructure, not a lock-in strategy.
          </p>
          <div className="bg-surface-2 border border-border rounded-xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "No proprietary template language",
                "No vendor lock-in",
                "No layout differences from open source",
                "No forced usage — self-host anytime",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Code example */}
      <section className="py-20 md:py-28 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
            Simple API
          </h2>
          <p className="text-xl text-text-secondary text-center max-w-2xl mx-auto mb-12">
            Same client.generate() function. Just set your API key.
          </p>
          <div className="bg-[#0d1117] border border-border rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              <code>
                <span className="text-[#8b949e]">{"// Set PDFN_API_KEY environment variable"}</span>
                {"\n"}
                <span className="text-[#ff7b72]">const</span>
                <span className="text-[#c9d1d9]"> client </span>
                <span className="text-[#ff7b72]">=</span>
                <span className="text-[#d2a8ff]"> pdfn</span>
                <span className="text-[#c9d1d9]">()</span>
                {"\n\n"}
                <span className="text-[#ff7b72]">const</span>
                <span className="text-[#c9d1d9]"> {"{ data }"} </span>
                <span className="text-[#ff7b72]">=</span>
                <span className="text-[#ff7b72]"> await</span>
                <span className="text-[#c9d1d9]"> client.</span>
                <span className="text-[#d2a8ff]">generate</span>
                <span className="text-[#c9d1d9]">(</span>
                <span className="text-[#c9d1d9]">&lt;</span>
                <span className="text-[#7ee787]">Invoice</span>
                <span className="text-[#c9d1d9]"> /&gt;)</span>
                {"\n\n"}
                <span className="text-[#8b949e]">{"// PDF/A archival compliance (Cloud only)"}</span>
                {"\n"}
                <span className="text-[#ff7b72]">const</span>
                <span className="text-[#c9d1d9]"> {"{ data }"} </span>
                <span className="text-[#ff7b72]">=</span>
                <span className="text-[#ff7b72]"> await</span>
                <span className="text-[#c9d1d9]"> client.</span>
                <span className="text-[#d2a8ff]">generate</span>
                <span className="text-[#c9d1d9]">(</span>
                <span className="text-[#c9d1d9]">&lt;</span>
                <span className="text-[#7ee787]">Invoice</span>
                <span className="text-[#c9d1d9]"> /&gt;, {"{ "}</span>
                <span className="text-[#c9d1d9]">standard</span>
                <span className="text-[#c9d1d9]">: </span>
                <span className="text-[#a5d6ff]">&apos;PDF/A-2b&apos;</span>
                <span className="text-[#c9d1d9]">{" }"})</span>
              </code>
            </pre>
          </div>
          <p className="text-sm text-text-muted mt-4 text-center">
            Layout is identical everywhere. PDF/A adds archival metadata and validation — it doesn&apos;t change rendering.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Get early access
          </h2>
          <p className="text-xl text-text-secondary mb-10">
            Cloud is currently in early access. Free while pricing is being finalized.
          </p>
          <a
            href="https://console.pdfn.dev/waitlist"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-black font-semibold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] text-lg"
          >
            Request early access
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <p className="text-sm text-text-muted mt-6">
            Questions?{" "}
            <a
              href="https://github.com/pdfnjs/pdfn/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors"
            >
              Start a discussion
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
