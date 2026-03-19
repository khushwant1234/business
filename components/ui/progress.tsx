"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<"div"> & { value?: number }) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-sm bg-muted",
        className,
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full bg-foreground transition-all"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}

export { Progress };
