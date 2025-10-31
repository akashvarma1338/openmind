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
import { Trophy, Star, Award } from "lucide-react";

type GamificationSidebarProps = {
  userPoints: number;
  userLevel: string;
};

export function GamificationSidebar({ userPoints, userLevel }: GamificationSidebarProps) {
  const updatedLeaderboard = leaderboardData
    .map((user) => (user.name === "You" ? { ...user, points: userPoints } : user))
    .sort((a, b) => b.points - a.points)
    .map((user, index) => ({ ...user, rank: index + 1 }));
  
  const userRank = updatedLeaderboard.find(u => u.name === 'You')?.rank;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline">
          <Trophy className="h-6 w-6 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>See how you rank among other learners!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-center rounded-lg bg-primary/10 p-4">
            <Award className="h-8 w-8 text-primary" />
            <div className="ml-4">
                <p className="font-semibold text-lg">{userLevel}</p>
                <p className="text-sm text-muted-foreground">Your current level</p>
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Learner</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updatedLeaderboard.map((user) => (
              <TableRow key={user.rank} className={user.name === 'You' ? 'bg-primary/10' : ''}>
                <TableCell className="font-medium">{user.rank}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell className="text-right flex justify-end items-center gap-1">
                  {user.points} <Star className="h-4 w-4 text-yellow-400" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
