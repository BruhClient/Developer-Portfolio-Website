"use client";

import { Moon, Sun, Sparkles, Code, Database } from "lucide-react";
import { useEffect, useState } from "react";

const icons = [Moon, Sun, Sparkles, Code, Database];

export function BackgroundFlyingIcons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="flying-icons-container">
      {Array.from({ length: 20 }).map((_, i) => {
        const Icon = icons[i % icons.length];

        return (
          <div
            key={i}
            className="flying-icon animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `5s`,
            }}
          >
            <Icon
              size={32}
              style={{
                transform: `scale(${0.5 + Math.random()})`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
