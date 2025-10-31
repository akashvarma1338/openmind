'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs, doc, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';
import { BookCopy } from 'lucide-react';
import { Button } from '../ui/button';

type Journey = {
  id: string;
  title: string;
  startDate: { toDate: () => Date };
  topicIds: string[];
};

type Topic = {
    id: string;
    day: number;
    title: string;
    reason: string;
    isFirstDay: boolean;
    isLastDay: boolean;
    readingMaterial: any;
    quiz: any;
    quizScore: number | null;
    createdAt: { toDate: () => Date };
}

type JourneyHistorySidebarProps = {
  user: User;
  onSelectJourney: (journey: any, topic: any) => void;
};

export function JourneyHistorySidebar({ user, onSelectJourney }: JourneyHistorySidebarProps) {
  const firestore = useFirestore();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const journeysRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, "users", user.uid, "learning_journeys");
  }, [user, firestore]);

  useEffect(() => {
    if (!journeysRef) return;

    const fetchJourneys = async () => {
        setIsLoading(true);
        const q = query(journeysRef, orderBy('startDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const journeysData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Journey));
        setJourneys(journeysData);
        setIsLoading(false);
    }
    fetchJourneys();
  }, [journeysRef]);

  const handleJourneyClick = async (journey: Journey) => {
    if (!firestore || !user) return;
    
    // Fetch the most recent topic for the selected journey
    const topicsRef = collection(firestore, "users", user.uid, "learning_journeys", journey.id, "topics");
    const topicsQuery = query(topicsRef, orderBy("day", "desc"), limit(1));
    const topicsSnapshot = await getDocs(topicsQuery);

    if (!topicsSnapshot.empty) {
        const topicDoc = topicsSnapshot.docs[0];
        const topicData = { id: topicDoc.id, ...topicDoc.data() } as Topic;
        onSelectJourney(journey, topicData);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline">
            <BookCopy className="h-6 w-6 text-primary" />
            Course History
        </CardTitle>
        <CardDescription>Review your past learning journeys.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : journeys.length === 0 ? (
                <p className='text-muted-foreground text-sm'>You haven't started any journeys yet.</p>
            ) : (
                <div className="space-y-2">
                    {journeys.map(journey => (
                        <Button 
                            key={journey.id}
                            variant="ghost" 
                            className="w-full justify-start text-left h-auto"
                            onClick={() => handleJourneyClick(journey)}
                        >
                            <div className="flex flex-col">
                                <span>{journey.title}</span>
                                <span className="text-xs text-muted-foreground">
                                    Started: {journey.startDate.toDate().toLocaleDateString()}
                                </span>
                            </div>
                        </Button>
                    ))}
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
