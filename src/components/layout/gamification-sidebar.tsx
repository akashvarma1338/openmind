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
import { collectionGroup, query, where, orderBy, limit } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

type GamificationSidebarProps = {
  userStreak: number;
  journeyTitle: string | null;
};

type LeaderboardUser = {
    id: string;
    name: string;
    streak: number;
}

export function GamificationSidebar({ userStreak, journeyTitle }: GamificationSidebarProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [leaderboard, setLeaderboard] = useState<{rank: number, name: string, streak: number, id: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const journeysQuery = useMemoFirebase(() => {
    if (!firestore || !journeyTitle) return null;
    // Query the 'learning_journeys' collection group to find all journeys with the same title.
    // This requires a composite index in Firestore: (title ==, startDate DESC)
    return query(
        collectionGroup(firestore, 'learning_journeys'), 
        where('title', '==', journeyTitle),
        orderBy('startDate', 'desc'),
        limit(10) // Limit to top 10 for performance
    );
  }, [firestore, journeyTitle]);

  const { data: journeys, isLoading: journeysLoading } = useCollection<{title: string, topicIds: string[]}>(journeysQuery);
  const userDocsRef = useMemoFirebase(() => {
    if (!firestore || !journeys || journeys.length === 0) return null;
    const userIds = journeys.map(j => j.id.split('/learning_journeys/')[0].split('/').pop());
    if (userIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('id', 'in', userIds));
  }, [firestore, journeys]);

  const { data: users, isLoading: usersLoading } = useCollection<{id: string, name: string}>(userDocsRef);

  const pointsRef = useMemoFirebase(() => {
    if (!firestore || !users || users.length === 0) return null;
    const userIds = users.map(u => u.id);
    if (userIds.length === 0) return null;
    return query(collection(firestore, 'curiosity_points'), where('userId', 'in', userIds), orderBy('streak', 'desc'));
  }, [firestore, users]);

  const { data: streaks, isLoading: streaksLoading } = useCollection<{userId: string, streak: number}>(pointsRef);

  useEffect(() => {
    setIsLoading(journeysLoading || usersLoading || streaksLoading);

    if (users && streaks) {
        const userMap = new Map(users.map(u => [u.id, u.name]));
        const rankedList = streaks
            .map((streakEntry, index) => ({
                rank: index + 1,
                id: streakEntry.userId,
                name: userMap.get(streakEntry.userId) || "Anonymous",
                streak: streakEntry.streak,
            }))
            .sort((a,b) => b.streak - a.streak) // re-sort after mapping
            .map((user, index) => ({...user, rank: index + 1})); // re-rank

        setLeaderboard(rankedList);
    }
  }, [users, streaks, journeysLoading, usersLoading, streaksLoading]);
  

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
                        Be the first to start this journey!
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
