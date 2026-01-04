export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-border rounded-full" />
          <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  );
}
