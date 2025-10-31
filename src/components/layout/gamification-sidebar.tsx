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
import { leaderboardData } from "@/lib/mock-data";
import { Trophy, Flame } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";

type GamificationSidebarProps = {
  userStreak: number;
  journeyTitle: string | null;
};

export function GamificationSidebar({ userStreak, journeyTitle }: GamificationSidebarProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const journeyUsersRef = useMemoFirebase(() => {
    if (!firestore || !journeyTitle) return null;
    // This is a simplified query. A real implementation would need a more scalable way
    // to find users on the same journey. This might involve a separate collection
    // that maps journeys to users. For this example, we query the 'learning_journeys'
    // subcollection across all users, which is not efficient at scale.
    // A better approach would be a collection group query, but that requires an index.
    // Or, a collection like /journeys/{journeyId}/participants/{userId}
    
    // We'll stick to mock data for the leaderboard for now as scalable queries are complex.
    return null; 
  }, [firestore, journeyTitle]);
  
  // const { data: journeyUsers } = useCollection(journeyUsersRef);

  // Using mock data as planned
  const updatedLeaderboard = leaderboardData
    .map((learner) => (learner.name === "You" ? { ...learner, streak: userStreak } : learner))
    .sort((a, b) => b.streak - a.streak)
    .map((learner, index) => ({ ...learner, rank: index + 1 }));
  
  const userRank = updatedLeaderboard.find(u => u.name === 'You')?.rank;

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
            {updatedLeaderboard.map((learner) => (
              <TableRow key={learner.rank} className={learner.name === 'You' ? 'bg-primary/10' : ''}>
                <TableCell className="font-medium">{learner.rank}</TableCell>
                <TableCell>{learner.name}</TableCell>
                <TableCell className="text-right flex justify-end items-center gap-1">
                  {learner.streak} <Flame className="h-4 w-4 text-orange-500" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
