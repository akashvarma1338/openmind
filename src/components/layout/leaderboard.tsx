
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type LeaderboardEntry = {
  id: string;
  userId: string;
  userName: string;
  streak: number;
  journeyTitle: string;
};

type LeaderboardProps = {
  user: User;
};

export function Leaderboard({ user }: LeaderboardProps) {
  const firestore = useFirestore();

  const leaderboardQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'curiosity_points'),
      orderBy('streak', 'desc'),
      limit(10)
    );
  }, [firestore]);

  const { data: leaderboardData, isLoading } = useCollection<LeaderboardEntry>(leaderboardQuery);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 0:
        return 'text-yellow-500';
      case 1:
        return 'text-gray-400';
      case 2:
        return 'text-yellow-700';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline">
          <Trophy className="h-6 w-6 text-primary" />
          Top Learners
        </CardTitle>
        <CardDescription>See who has the highest curiosity streak!</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !leaderboardData || leaderboardData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contenders yet. Be the first!</p>
        ) : (
          <ul className="space-y-3">
            {leaderboardData.map((entry, index) => {
              const isCurrentUser = entry.userId === user.uid;
              return (
                <li
                  key={entry.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-md transition-colors',
                    isCurrentUser ? 'bg-primary/10' : 'bg-card'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn('font-bold text-lg w-6', getRankColor(index))}>
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className={cn('font-semibold', isCurrentUser && 'text-primary')}>
                        {isCurrentUser ? 'You' : entry.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.journeyTitle}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-orange-500">
                    <Flame className="h-5 w-5" />
                    <span>{entry.streak}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
