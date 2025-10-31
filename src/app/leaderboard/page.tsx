
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';
import { leaderboardData, type LeaderboardEntry } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import AuthPage from '../auth/page';


export default function LeaderboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/auth');
    }
  };
  
  const handleHomeClick = () => {
    router.push('/');
  }

  const rankedData = useMemo(() => {
    const currentUserData = {
        name: userProfile?.name || 'You',
        points: userProfile?.curiosityPoints || 0,
        isUser: true,
    };
    
    // Combine mock data and the current user's data
    const combinedData = [...leaderboardData, currentUserData];

    // Sort by points descending
    const sortedData = combinedData.sort((a, b) => b.points - a.points);

    // Assign ranks
    return sortedData.map((entry, index) => ({ ...entry, rank: index + 1 }));

  }, [userProfile]);

  if (isUserLoading || isProfileLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        streak={userProfile?.streak || 0} 
        points={userProfile?.curiosityPoints || 0}
        onSignOut={handleSignOut} 
        onHomeClick={handleHomeClick} 
        onHistoryClick={() => {}} 
      />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
            <Card>
                <CardHeader className="text-center">
                    <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
                    <CardTitle className="text-3xl font-bold font-headline mt-4">Curiosity Leaderboard</CardTitle>
                    <CardDescription>See who is the most curious learner!</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] text-center">Rank</TableHead>
                                <TableHead>Learner</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rankedData.map((entry) => (
                                <TableRow key={entry.rank} className={cn(entry.isUser && 'bg-primary/10 font-bold')}>
                                    <TableCell className="text-center">{entry.rank}</TableCell>
                                    <TableCell>{entry.name}</TableCell>
                                    <TableCell className="text-right">{entry.points}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
