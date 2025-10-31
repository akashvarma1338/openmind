"use client";

import { Logo } from "@/components/common/icons";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-lg font-semibold">Loading...</div>
       <div className="absolute bottom-4 left-4">
        <Logo className="h-6 w-6 text-muted-foreground/50" />
      </div>
    </div>
  );
}
