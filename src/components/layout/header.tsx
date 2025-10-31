import { Logo } from "@/components/common/icons";
import { Button } from "../ui/button";
import { Flame, LogOut, Home, User, BookMarked, History, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { streams } from "@/lib/pregenerated-courses";

type HeaderProps = {
  streak: number;
  points: number;
  onSignOut: () => void;
  onHomeClick: () => void;
  onHistoryClick: () => void;
};

export function Header({ streak, points, onSignOut, onHomeClick, onHistoryClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onHomeClick} className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground hidden sm:block">
              OpenMind
            </h1>
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" onClick={onHomeClick} aria-label="Home">
            <Home className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onHistoryClick} aria-label="Journey History">
              <History className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Browse Courses">
                <BookMarked className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Browse Courses</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {streams.map((stream) => (
                 <Link href={`/courses/${stream.id}`} passHref key={stream.id}>
                    <DropdownMenuItem>
                        {stream.name}
                    </DropdownMenuItem>
                 </Link>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/leaderboard" passHref>
            <Button variant="ghost" size="icon" aria-label="Leaderboard">
                <Trophy className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border rounded-full px-3 h-9 text-sm font-semibold">
              <Flame className="h-5 w-5 text-orange-400" />
              <span>1</span>
              <span className="hidden sm:inline-flex text-muted-foreground">Streak</span>
            </div>
            <div className="flex items-center gap-2 border rounded-full px-3 h-9 text-sm font-semibold">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span>{points}</span>
                <span className="hidden sm:inline-flex text-muted-foreground">Points</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User Menu">
                    <User className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile" passHref>
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
