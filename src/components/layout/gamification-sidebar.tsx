


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Flame } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

type GamificationSidebarProps = {
  userStreak: number;
  journeyTitle: string | null;
};

type LeaderboardUser = {
  rank: number;
  id: string;
  name: string;
  streak: number;
};

export function GamificationSidebar({ userStreak, journeyTitle }: GamificationSidebarProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const pointsQuery = useMemoFirebase(() => {
    if (!firestore || !journeyTitle) {
      return null;
    }
    // Query the `curiosity_points` collection directly, filtering by the denormalized journeyTitle
    return query(
      collection(firestore, 'curiosity_points'),
      where('journeyTitle', '==', journeyTitle),
      orderBy('streak', 'desc'),
      limit(10)
    );
  }, [firestore, journeyTitle]);

  const { data: streaks, isLoading } = useCollection<{ userId: string, userName: string, streak: number }>(pointsQuery);

  const leaderboard: LeaderboardUser[] = (streaks || [])
    .map((streakEntry, index) => ({
      rank: index + 1,
      id: streakEntry.userId,
      name: streakEntry.userName || "Anonymous",
      streak: streakEntry.streak,
    }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline">
          <Trophy className="h-6 w-6 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          {journeyTitle 
            ? `Ranking for "${journeyTitle}"` 
            : "See how you rank among other learners!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Learner</TableHead>
              <TableHead className="text-right">Streak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : leaderboard.length > 0 ? (
                leaderboard.map((learner) => (
                <TableRow key={learner.id} className={learner.id === user?.uid ? 'bg-primary/10' : ''}>
                    <TableCell className="font-medium">{learner.rank}</TableCell>
                    <TableCell className="font-medium flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${learner.name}`} />
                            <AvatarFallback>{learner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {learner.name}
                    </TableCell>
                    <TableCell className="text-right flex justify-end items-center gap-1">
                    {learner.streak} <Flame className="h-4 w-4 text-orange-500" />
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                        {journeyTitle ? "Be the first to start this journey!" : "No active journey."}
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    