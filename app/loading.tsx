export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background"
    >
      {/* Determinate-looking bar rather than a spinner — reads as progress */}
      <div className="relative h-0.5 w-40 overflow-hidden rounded-full bg-secondary">
        <div className="animate-shimmer absolute inset-y-0 w-1/2 rounded-full bg-primary" />
      </div>
      <span className="label-mono text-muted-foreground">Loading</span>
      <span className="sr-only">Loading page content</span>
    </div>
  );
}
