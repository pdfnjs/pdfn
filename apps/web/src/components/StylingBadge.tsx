interface StylingBadgeProps {
  styling: string;
  size?: "default" | "small";
  showTooltip?: boolean;
}

const stylingConfig: Record<string, { label: string; className: string; tooltip: string }> = {
  tailwind: {
    label: "Tailwind",
    className: "bg-cyan-500/20 text-cyan-400",
    tooltip: "Uses Tailwind CSS utility classes via <Tailwind> wrapper",
  },
  inline: {
    label: "Inline Styles",
    className: "bg-zinc-500/20 text-zinc-400",
    tooltip: "Uses React's style={{}} prop for styling",
  },
  cssProp: {
    label: "css prop",
    className: "bg-purple-500/20 text-purple-400",
    tooltip: "Embeds CSS string directly via Document's css prop",
  },
  // FIXME: Plain CSS bundling not yet implemented. @imports in plain CSS files
  // are not resolved. Need to fix bundling for both Node.js and edge runtimes.
  plainCss: {
    label: "Plain CSS",
    className: "bg-emerald-500/20 text-emerald-400",
    tooltip: "Uses plain CSS file loaded via Document's css prop",
  },
};

export function StylingBadge({ styling, size = "default", showTooltip = false }: StylingBadgeProps) {
  const { label, className, tooltip } = stylingConfig[styling] || {
    label: styling,
    className: "bg-surface-2 text-text-muted",
    tooltip: "",
  };
  const sizeClass = size === "small" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5";

  return (
    <span className="inline-flex items-center gap-1 group relative">
      <span className={`${sizeClass} rounded-full font-medium ${className}`}>
        {label}
      </span>
      {showTooltip && tooltip && (
        <>
          <svg
            className={`${size === "small" ? "w-3 h-3" : "w-3.5 h-3.5"} text-text-muted cursor-help`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {tooltip}
          </span>
        </>
      )}
    </span>
  );
}

// Export config for use in other components (e.g., mobile dropdown)
export function getStylingLabel(styling: string): string {
  return stylingConfig[styling]?.label || styling;
}
