'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { streams } from '@/lib/pregenerated-courses';
import { InterestForm } from '@/components/onboarding/interest-form';
import { useUser } from '@/firebase';
import AuthPage from '@/app/auth/page';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Header } from '@/components/layout/header';
import { signOut } from 'firebase/auth';
import { useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { doc } from 'firebase/firestore';


type SubjectPageProps = {
  onStartJourney: (interests: string[]) => void;
};

function SubjectPage({ onStartJourney }: SubjectPageProps) {
  const params = useParams();
  const streamId = params.streamId as string;
  const subjectId = params.subjectId as string;

  const stream = streams.find(s => s.id === streamId);
  const subject = stream?.subjects.find(s => s.id === subjectId);

  if (!subject) {
    return <p>Subject not found.</p>;
  }
  
  const handleStart = () => {
    // We pass the subject name as the "interest" to start the journey
    onStartJourney([subject.name]);
  };

  return (
    <Card className="overflow-hidden">
       <div className="relative h-48 w-full">
          <Image
              src={`https://picsum.photos/seed/${subject.id}/1200/400`}
              alt={subject.description}
              fill
              className="object-cover"
              data-ai-hint={subject.imageHint}
              priority
          />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
       </div>
    <CardHeader className="text-center -mt-20 z-10 relative">
      <CardTitle className="text-3xl md:text-4xl font-extrabold">
        {subject.name}
      </CardTitle>
      <CardDescription className="text-lg max-w-2xl mx-auto text-muted-foreground">
        {subject.description}
      </CardDescription>
    </CardHeader>
    <CardContent className="p-6">
        <p className="text-center text-muted-foreground mb-6">
            Ready to dive in? Start your personalized learning journey on this topic.
        </p>
      <div className="flex justify-center">
        <Button onClick={handleStart} size="lg" className="text-lg font-semibold">
          <Sparkles className="mr-2 h-5 w-5" />
          Start My Journey
        </Button>
      </div>
    </CardContent>
  </Card>
  );
}


// This is a wrapper component that handles auth and passes the correct function to the SubjectPage
export default function SubjectPageWrapper() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, "users", user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<{streak: number, curiosityPoints: number}>(userProfileRef);
    const streak = userProfile?.streak ?? 0;
    const points = userProfile?.curiosityPoints ?? 0;

    // This is a placeholder function that will be replaced by the real one from the main page
    // The user will be redirected to the main page to actually start the journey
    const handleStartJourney = (interests: string[]) => {
        // Store in local storage and redirect
        localStorage.setItem('pregeneratedJourneyInterests', JSON.stringify(interests));
        router.push('/');
    };

    const handleSignOut = async () => {
        if (auth) {
          await signOut(auth);
          router.push('/auth');
        }
    };

    const handleHomeClick = () => {
        router.push('/');
    }

    if (isUserLoading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <AuthPage />;
    }

    return (
        <div className="flex flex-col min-h-screen">
          <Header points={points} streak={streak} onSignOut={handleSignOut} onHomeClick={handleHomeClick} onHistoryClick={() => router.push('/')} />
          <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-3xl">
                <SubjectPage onStartJourney={handleStartJourney} />
            </div>
          </main>
        </div>
    );
}
