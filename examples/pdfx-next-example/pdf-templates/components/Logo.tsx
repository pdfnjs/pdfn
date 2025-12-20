/**
 * Shared Logo component for PDF templates
 */
export function Logo() {
  return (
    <svg width="140" height="40" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Abstract tech logo */}
      <rect x="0" y="8" width="24" height="24" rx="4" fill="#2563eb" />
      <rect x="6" y="14" width="12" height="12" rx="2" fill="#60a5fa" />
      <rect x="10" y="18" width="4" height="4" rx="1" fill="white" />
      <text x="32" y="26" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="700" fill="#1e293b">
        TechFlow
      </text>
    </svg>
  );
}
