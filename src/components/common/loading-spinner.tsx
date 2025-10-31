"use client";

import { Logo } from "@/components/common/icons";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-dashed border-primary"></div>
          <div className="absolute inset-2 animate-spin-reverse rounded-full border-4 border-solid border-accent"></div>
        </div>
        <span className="text-lg font-semibold tracking-wider">Loading...</span>
      </div>
      <div className="absolute bottom-4 left-4">
        <Logo className="h-6 w-6 text-muted-foreground/50" />
      </div>
    </div>
  );
}
