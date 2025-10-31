import { Logo } from "@/components/common/icons";
import { Button } from "../ui/button";
import { Flame, LogOut, Home, User, BookMarked, History, Sparkles, Trophy, Menu } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { streams } from "@/lib/pregenerated-courses";
import { ThemeToggle } from "../common/theme-toggle";

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
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Main Menu">
                  <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onHomeClick}>
                <Home className="mr-2 h-4 w-4"/>
                <span>Home</span>
              </DropdownMenuItem>
               <DropdownMenuItem onClick={onHistoryClick}>
                <History className="mr-2 h-4 w-4"/>
                <span>Journey History</span>
              </DropdownMenuItem>
              <Link href="/leaderboard" passHref>
                <DropdownMenuItem>
                  <Trophy className="mr-2 h-4 w-4"/>
                  <span>Leaderboard</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                      <BookMarked className="mr-2 h-4 w-4"/>
                      <span>Browse Courses</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                          {streams.map((stream) => (
                              <Link href={`/courses/${stream.id}`} passHref key={stream.id}>
                                  <DropdownMenuItem>
                                      {stream.name}
                                  </DropdownMenuItem>
                              </Link>
                          ))}
                      </DropdownMenuSubContent>
                  </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

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
