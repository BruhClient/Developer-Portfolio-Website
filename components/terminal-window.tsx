import { cn } from "@/lib/utils";

export function TerminalWindow({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/50">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="ml-2 text-xs text-muted-foreground truncate">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
