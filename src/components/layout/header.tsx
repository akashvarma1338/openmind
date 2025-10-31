import { Logo } from "@/components/common/icons";
import { Button } from "../ui/button";
import { Star, LogOut } from "lucide-react";

type HeaderProps = {
  points: number;
  onSignOut: () => void;
};

export function Header({ points, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary hidden sm:block">
            Curiosity Engine
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-card border rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span>{points}</span>
            <span className="hidden sm:inline">Curiosity Points</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
