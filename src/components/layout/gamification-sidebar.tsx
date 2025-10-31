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
import { useUser, useFirestore } from "@/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";

type GamificationSidebarProps = {
  userStreak: number;
  journeyTitle: string | null;
};

type LeaderboardUser = {
  rank: number;
  userId: string;
  name: string;
  streak: number;
};

export function GamificationSidebar({ userStreak, journeyTitle }: GamificationSidebarProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!firestore || !journeyTitle) {
        setLeaderboard([]);
        return;
    }

    const buildLeaderboard = async () => {
        setIsLoading(true);
        try {
            const pointsQuery = query(
                collection(firestore, 'curiosity_points'),
                where('journeyTitle', '==', journeyTitle),
                orderBy('streak', 'desc'),
                limit(10)
            );

            const querySnapshot = await getDocs(pointsQuery);
            const streaks = querySnapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() } as { userId: string, userName: string, streak: number }));
            
            const leaderboardData: LeaderboardUser[] = streaks.map((streakEntry, index) => ({
                rank: index + 1,
                userId: streakEntry.userId,
                name: streakEntry.userName || "Anonymous",
                streak: streakEntry.streak,
            }));

            setLeaderboard(leaderboardData);

        } catch (error) {
            console.error("Error building leaderboard:", error);
        } finally {
            setIsLoading(false);
        }
    }

    buildLeaderboard();

  }, [firestore, journeyTitle]);
  
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
                <TableRow key={learner.userId} className={learner.userId === user?.uid ? 'bg-primary/10' : ''}>
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
