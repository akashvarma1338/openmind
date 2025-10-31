"use client";

import { Logo } from "@/components/common/icons";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Logo className="h-24 w-24 text-primary animate-pulse" />
        <span className="text-lg font-semibold tracking-wider">Loading...</span>
      </div>
    </div>
  );
}
