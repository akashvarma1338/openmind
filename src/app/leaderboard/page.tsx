
'use client';

import { useMemo, useRef, useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Medal, Trophy, Download } from 'lucide-react';
import { leaderboardData, type LeaderboardEntry } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import AuthPage from '../auth/page';
import { Button } from '@/components/ui/button';
import { Certificate } from '@/components/leaderboard/certificate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function LeaderboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  const certificateRef = useRef<HTMLDivElement>(null);

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
    if (!userProfile) return leaderboardData.sort((a,b) => b.points - a.points).map((e, i) => ({ ...e, rank: i + 1 }));

    const currentUserData = {
        name: userProfile?.name || 'You',
        points: userProfile?.curiosityPoints || 0,
        isUser: true,
    };
    
    // Make sure we are not duplicating the current user if they are also in the mock data
    const otherUsers = leaderboardData.filter(d => d.name.toLowerCase() !== currentUserData.name.toLowerCase());
    
    const combinedData = [...otherUsers, currentUserData];
    const sortedData = combinedData.sort((a, b) => b.points - a.points);
    return sortedData.map((entry, index) => ({ ...entry, rank: index + 1 }));

  }, [userProfile]);

  const currentUserRank = useMemo(() => {
      return rankedData.find(e => e.isUser);
  }, [rankedData]);

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current || !currentUserRank) return;

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(certificateRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`OpenMind-Certificate-${currentUserRank.name}.pdf`);
    } catch (error) {
        console.error("Failed to generate certificate:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  const getRankIndicator = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-yellow-600" />;
    return <span className="font-mono text-sm">{rank}</span>;
  }

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
        onHistoryClick={() => router.push('/')} 
      />
      
      {currentUserRank && (
        <Certificate 
            ref={certificateRef}
            name={currentUserRank.name}
            rank={currentUserRank.rank}
            points={currentUserRank.points}
            date={new Date()}
        />
      )}

      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
            <Card className="overflow-hidden">
                <CardHeader className="text-center bg-card/50">
                    <Trophy className="h-12 w-12 mx-auto text-primary" />
                    <CardTitle className="text-3xl font-bold mt-4">Curiosity Leaderboard</CardTitle>
                    <CardDescription>See who is the most curious learner!</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] text-center">Rank</TableHead>
                                <TableHead>Learner</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                                <TableHead className="w-[120px] text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rankedData.map((entry) => (
                                <TableRow key={entry.rank} className={cn(entry.isUser && 'bg-primary/10')}>
                                    <TableCell className="text-center">
                                      <div className="flex justify-center items-center h-full">
                                        {getRankIndicator(entry.rank)}
                                      </div>
                                    </TableCell>
                                    <TableCell className={cn(entry.isUser && 'font-bold text-primary')}>{entry.name}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.points}</TableCell>
                                    <TableCell className="text-center">
                                        {entry.isUser && (
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              onClick={handleDownloadCertificate}
                                              disabled={isDownloading}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                {isDownloading ? '...' : 'Certificate'}
                                            </Button>
                                        )}
                                    </TableCell>
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
