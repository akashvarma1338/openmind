

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
import { collection, collectionGroup, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const buildLeaderboard = async () => {
      if (!firestore || !journeyTitle) {
        setLeaderboard([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Step 1: Find all journey documents that match the current journey title
        const journeysQuery = query(
          collectionGroup(firestore, 'learning_journeys'),
          where('title', '==', journeyTitle)
        );
        const journeysSnapshot = await getDocs(journeysQuery);
        const journeys = journeysSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as object, _path: { segments: doc.ref.path.split('/') } }));

        if (journeys.length === 0) {
          setLeaderboard([]);
          setIsLoading(false);
          return;
        }

        const userIds = journeys.map(j => j._path.segments[1]).filter(Boolean);
        if (userIds.length === 0) {
          setLeaderboard([]);
          setIsLoading(false);
          return;
        }

        // Step 2: Use the user IDs from those journeys to query the `curiosity_points` collection
        const pointsQuery = query(
          collection(firestore, 'curiosity_points'),
          where('userId', 'in', userIds.slice(0, 30)), // Firestore 'in' query limit is 30
          orderBy('streak', 'desc'),
          limit(10)
        );

        const streakSnapshot = await getDocs(pointsQuery);
        const streaks = streakSnapshot.docs.map(doc => doc.data() as { userId: string, userName: string, streak: number });

        const rankedList = streaks
          .map((streakEntry, index) => ({
            rank: index + 1,
            id: streakEntry.userId,
            name: streakEntry.userName || "Anonymous",
            streak: streakEntry.streak,
          }))
          .sort((a, b) => b.streak - a.streak)
          .map((user, index) => ({ ...user, rank: index + 1 }));

        setLeaderboard(rankedList);

      } catch (error) {
        if (error instanceof Error && 'code' in error && (error as any).code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
              operation: 'list',
              path: `learning_journeys where title == ${journeyTitle}`, 
            });
            errorEmitter.emit('permission-error', contextualError);
        }
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

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
