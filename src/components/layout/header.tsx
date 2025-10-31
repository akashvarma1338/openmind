import { Logo } from "@/components/common/icons";
import { Button } from "../ui/button";
import { Flame, LogOut, Home, User, BookMarked } from "lucide-react";
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
  onSignOut: () => void;
  onHomeClick: () => void;
};

export function Header({ streak, onSignOut, onHomeClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary hidden sm:block">
            OpenMind
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" onClick={onHomeClick} aria-label="Home">
            <Home className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Browse Courses">
                <BookMarked className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

          <Link href="/profile" passHref>
            <Button variant="ghost" size="icon" aria-label="Profile">
                <User className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 bg-card border rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm">
            <Flame className="h-5 w-5 text-orange-500 fill-orange-400" />
            <span>{streak}</span>
            <span className="hidden sm:inline ml-1">Day Streak</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
