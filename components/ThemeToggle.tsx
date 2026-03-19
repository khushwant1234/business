"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const CYCLE: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const current = (theme as "light" | "dark" | "system") ?? "system";
  const index = CYCLE.indexOf(current);
  const nextTheme = CYCLE[(index + 1) % CYCLE.length];

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-sm"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch theme. Current: ${current}`}
      title={`Theme: ${current}`}
    >
      {current === "dark" ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  );
}
