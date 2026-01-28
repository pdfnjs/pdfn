"use client";

import { useState, useEffect, useRef } from "react";
import { getPageDimensions, type PageSize, type Orientation } from "@/lib/page-sizes";

interface PdfPreviewProps {
  /** URL to fetch the HTML preview from */
  src: string;
  /** Page size (A4, Letter, etc.) */
  size: PageSize;
  /** Page orientation */
  orientation?: Orientation;
  /** Height of the preview container. Use "fill" to fill parent container. */
  height?: number | "fill";
  /** Show zoom controls */
  showZoomControls?: boolean;
  /** Show open in new tab button */
  showOpenButton?: boolean;
  /** Called when iframe finishes loading */
  onLoad?: () => void;
}

export function PdfPreview({
  src,
  size,
  orientation = "portrait",
  height = 500,
  showZoomControls = true,
  showOpenButton = true,
  onLoad,
}: PdfPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [previewZoom, setPreviewZoom] = useState<"fit" | "100">("fit");
  const [containerDimensions, setContainerDimensions] = useState({ width: 400, height: typeof height === "number" ? height : 500 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isFillMode = height === "fill";

  const { width: pageW, height: pageH } = getPageDimensions(size, orientation);

  // Measure container for responsive scaling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height: h } = entry.contentRect;
        setContainerDimensions({
          width: Math.max(width - 24, 200),
          height: Math.max(h - 24, 300),
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true);
  }, [src]);

  const fitScale = Math.min(
    containerDimensions.width / pageW,
    containerDimensions.height / pageH
  );
  const currentScale = previewZoom === "100" ? 1 : fitScale;
  const displayW = pageW * currentScale;
  const displayH = pageH * currentScale;

  return (
    <div className="relative h-full">
      {/* Open in new tab button */}
      {showOpenButton && (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 bg-black/60 rounded-md text-white/60 hover:text-white transition-colors"
          title="Open in new tab"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      {/* Preview container */}
      <div
        ref={containerRef}
        className={`${isFillMode ? "h-full" : ""} ${
          previewZoom === "100"
            ? "overflow-auto"
            : "overflow-hidden flex items-center justify-center p-3"
        }`}
        style={isFillMode ? undefined : { height }}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* PDF preview iframe */}
        <div
          className={`bg-white rounded-lg shadow-xl overflow-hidden ring-1 ring-black/10 flex-shrink-0 transition-opacity duration-200 ${
            previewZoom === "100" ? "m-6" : ""
          }`}
          style={{
            width: displayW,
            height: displayH,
            opacity: isLoading ? 0.4 : 1,
          }}
        >
          <iframe
            key={`${src}-${previewZoom}`}
            src={src}
            title="PDF Preview"
            style={{
              width: pageW,
              height: pageH,
              transform: `scale(${currentScale})`,
              transformOrigin: "top left",
              border: "none",
            }}
            onLoad={handleIframeLoad}
          />
        </div>
      </div>

      {/* Zoom controls */}
      {showZoomControls && (
        <div className="absolute bottom-3 right-3 flex items-center bg-black/60 rounded-md p-0.5">
          <button
            onClick={() => setPreviewZoom("fit")}
            className={`w-10 py-1 text-[10px] font-medium rounded transition-colors ${
              previewZoom === "fit"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Fit
          </button>
          <button
            onClick={() => setPreviewZoom("100")}
            className={`w-10 py-1 text-[10px] font-medium rounded transition-colors ${
              previewZoom === "100"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            100%
          </button>
        </div>
      )}
    </div>
  );
}
