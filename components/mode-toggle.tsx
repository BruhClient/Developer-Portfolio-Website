"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="sm"
      variant="ghost"
      className="text-xs text-muted-foreground hover:text-primary px-2"
    >
      [{theme === "light" ? "dark" : "light"}]
    </Button>
  );
}
