import { Header, Footer } from "@/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "pdfn Cloud - Managed PDF Generation",
  description: "Managed PDF generation and compliance for pdfn templates. Same templates, same layout, less operational burden.",
};

export default function CloudPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-24 px-6 hero-glow overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6 animate-fade-in">
            <span>Early Access</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4 leading-tight animate-fade-in whitespace-nowrap">
            <span className="text-text-primary">pdf</span>
            <span className="text-primary">n</span> Cloud
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto animate-fade-in-delay-1">
            Managed PDF generation and compliance for pdfn templates.
            <br />
            <span className="text-text-muted">Same templates. Same layout. Less operational burden.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-2">
            <a
              href="https://console.pdfn.dev/waitlist"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-lg transition-colors btn-glow"
            >
              Request early access
            </a>
            <a
              href="https://github.com/pdfnjs/pdfn#quick-start"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-1 border border-border hover:border-border-hover rounded-lg px-6 py-3 font-medium text-text-primary transition-colors"
            >
              View docs
            </a>
          </div>
        </div>
      </section>

      {/* Why Cloud exists */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
            Why Cloud exists
          </h2>
          <p className="text-xl text-text-secondary text-center max-w-2xl mx-auto mb-12">
            pdfn is fully usable as open source. Cloud exists to handle the parts teams repeatedly told us they don&apos;t want to own.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🔧", title: "Chromium reliability", desc: "Memory management and process isolation handled for you" },
              { icon: "⚡", title: "Cold starts & scaling", desc: "Pre-warmed instances, auto-scaling, no cold boot penalty" },
              { icon: "📋", title: "PDF/A compliance", desc: "Archival standards (PDF/A-1b, 2b, 3b) with validation" },
              { icon: "✓", title: "Post-processing", desc: "Metadata injection, validation, and guarantees" },
            ].map((item, i) => (
              <div key={i} className="card-hover bg-surface-2 border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                </div>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Cloud gives you */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
            What you get
          </h2>
          <p className="text-xl text-text-secondary text-center max-w-2xl mx-auto mb-12">
            Everything you need for production PDF generation.
          </p>
          <div className="bg-surface-1 border border-border rounded-xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Managed Chromium — no Docker, no Puppeteer setup",
                "Identical rendering to open source",
                "PDF/A-1b, PDF/A-2b, PDF/A-3b generation",
                "Built-in validation",
                "Usage-based pricing",
                "99.9% uptime SLA",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Cloud does NOT do - Trust building */}
      <section className="py-20 px-6 bg-surface-1">
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

      {/* Who Cloud is for */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
            Built for
          </h2>
          <p className="text-xl text-text-secondary text-center max-w-2xl mx-auto mb-12">
            Teams that need reliable, compliant PDF generation at scale.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🏢", label: "Insurance quotes & policies" },
              { icon: "🧾", label: "Invoices & e-invoices" },
              { icon: "🏛️", label: "Government & regulated PDFs" },
              { icon: "💊", label: "Pharma & healthcare" },
              { icon: "☁️", label: "Serverless deployments" },
              { icon: "📊", label: "High-volume reports" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-1 border border-border rounded-lg px-4 py-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-text-secondary text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code example */}
      <section className="py-20 px-6 bg-surface-1">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">
            Simple API
          </h2>
          <p className="text-xl text-text-secondary text-center max-w-2xl mx-auto mb-12">
            Same generate() function. Just add your API key.
          </p>
          <div className="bg-[#0d1117] border border-border rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm">
              <code>
                <span className="text-[#8b949e]">{"// Set PDFN_API_KEY environment variable"}</span>
                {"\n\n"}
                <span className="text-[#ff7b72]">const</span>
                <span className="text-[#c9d1d9]"> pdf </span>
                <span className="text-[#ff7b72]">=</span>
                <span className="text-[#ff7b72]"> await</span>
                <span className="text-[#d2a8ff]"> generate</span>
                <span className="text-[#c9d1d9]">(</span>
                <span className="text-[#c9d1d9]">&lt;</span>
                <span className="text-[#7ee787]">Invoice</span>
                <span className="text-[#c9d1d9]"> /&gt;)</span>
                {"\n\n"}
                <span className="text-[#8b949e]">{"// PDF/A archival compliance (Cloud only)"}</span>
                {"\n"}
                <span className="text-[#ff7b72]">const</span>
                <span className="text-[#c9d1d9]"> pdf </span>
                <span className="text-[#ff7b72]">=</span>
                <span className="text-[#ff7b72]"> await</span>
                <span className="text-[#d2a8ff]"> generate</span>
                <span className="text-[#c9d1d9]">(</span>
                <span className="text-[#c9d1d9]">&lt;</span>
                <span className="text-[#7ee787]">Invoice</span>
                <span className="text-[#c9d1d9]"> /&gt;, </span>
                <span className="text-[#c9d1d9]">{"{ "}</span>
                <span className="text-[#c9d1d9]">standard</span>
                <span className="text-[#c9d1d9]">: </span>
                <span className="text-[#a5d6ff]">&apos;PDF/A-2b&apos;</span>
                <span className="text-[#c9d1d9]">{" }"}</span>
                <span className="text-[#c9d1d9]">)</span>
              </code>
            </pre>
          </div>
          <p className="text-sm text-text-muted mt-4 text-center">
            Layout is identical everywhere. PDF/A adds archival metadata and validation — it doesn&apos;t change rendering.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Get early access
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Cloud is currently in early access. Free while pricing is being finalized.
          </p>
          <a
            href="https://console.pdfn.dev/waitlist"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-lg transition-colors btn-glow inline-block"
          >
            Request early access
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
