import { cn } from "@/lib/utils";

type Tag = "span" | "h1" | "h2" | "h3" | "p" | "div";

export function GradientText({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: Tag;
}) {
  return (
    <Tag className={cn("terminal-green terminal-glow", className)}>
      {children}
    </Tag>
  );
}
