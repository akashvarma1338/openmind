"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { InterestForm } from "@/components/onboarding/interest-form";
import { DailyJourneyDisplay } from "@/components/journey/daily-journey-display";
import { GamificationSidebar } from "@/components/layout/gamification-sidebar";
import { Button } from "@/components/ui/button";
import {
  generateDailyTopic,
  type GenerateDailyTopicOutput,
} from "@/ai/flows/generate-daily-topic";
import {
  curateReadingMaterial,
  type CurateReadingMaterialOutput,
} from "@/ai/flows/curate-reading-material";
import {
  buildMicroQuiz,
  type BuildMicroQuizOutput,
} from "@/ai/flows/build-micro-quiz";
import { useUser, useAuth, setDocumentNonBlocking, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import AuthPage from "@/app/auth/page";
import { signOut } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { doc, Timestamp } from "firebase/firestore";
import { LoadingSpinner } from "@/components/common/loading-spinner";

type JourneyState = {
  journeyTitle: string | null;
  currentTopic: GenerateDailyTopicOutput | null;
  readingMaterial: CurateReadingMaterialOutput | null;
  quiz: BuildMicroQuizOutput | null;
  quizScore: number | null;
  day: number;
  isCompleted: boolean;
};

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

export default function Home() {
  const [interests, setInterests] = useState<string[]>([]);
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userStreakRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "curiosity_points", user.uid);
  }, [user, firestore]);

  const { data: userStreakDoc } = useDoc<{streak: number, timestamp: Timestamp}>(userStreakRef);
  const streak = userStreakDoc?.streak ?? 0;

  const startNewJourney = () => {
    setInterests([]);
    setJourneyState(null);
  };

  const generateAndSetDailyContent = async (topic: GenerateDailyTopicOutput) => {
    const material = await curateReadingMaterial({ topic: topic.topic, interests });
    const fullText = material.articles.map(a => `${a.title}\n${a.explanation}`).join("\n\n");
    const quizData = await buildMicroQuiz({
      topic: topic.topic,
      readingMaterial: fullText,
    });

    setJourneyState(prev => ({
      ...prev!,
      currentTopic: topic,
      readingMaterial: material,
      quiz: quizData,
      quizScore: null, // Reset score for the new day
    }));
  };
  
  const handleInterestsSubmit = async (submittedInterests: string[]) => {
    if (isLoading || !user || !firestore) return;
    setIsLoading(true);
    setInterests(submittedInterests);
    setJourneyState(null); // Clear previous journey state

    try {
      // Generate the first topic of a new journey
      const firstTopic = await generateDailyTopic({ interests: submittedInterests });
      
      const streakDocRef = doc(firestore, 'curiosity_points', user.uid);
      setDocumentNonBlocking(streakDocRef, {
        userId: user.uid,
        streak: 1, // Start with a streak of 1
        timestamp: new Date()
      }, { merge: true });


      setJourneyState({
        journeyTitle: firstTopic.journeyTitle,
        currentTopic: null, // will be set by generateAndSetDailyContent
        readingMaterial: null,
        quiz: null,
        quizScore: null,
        day: 1,
        isCompleted: false,
      });
      await generateAndSetDailyContent(firstTopic);

    } catch (error) {
      console.error("Failed to generate learning journey:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const advanceToNextDay = async () => {
    if (!journeyState || !journeyState.journeyTitle || isLoading || !user || !firestore) return;

    setIsLoading(true);
    try {
      const nextTopic = await generateDailyTopic({
        interests,
        journeyTitle: journeyState.journeyTitle,
      });

      const currentStreak = userStreakDoc?.streak || 0;
      const lastUpdate = userStreakDoc?.timestamp?.toDate();
      const now = new Date();

      let newStreak = currentStreak;
      if (!lastUpdate || !isSameDay(lastUpdate, now)) {
        newStreak = currentStreak + 1;
        const streakDocRef = doc(firestore, 'curiosity_points', user.uid);
        setDocumentNonBlocking(streakDocRef, {
          userId: user.uid,
          streak: newStreak,
          timestamp: now
        }, { merge: true });
      }
      
      setJourneyState(prev => ({
        ...prev!,
        day: prev!.day + 1,
        isCompleted: nextTopic.isLastDay,
      }));
      await generateAndSetDailyContent(nextTopic);

    } catch (error) {
      console.error("Failed to advance to next day:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleQuizSubmit = (
    correctAnswers: number,
    totalQuestions: number
  ) => {
    if (!firestore || !user) return;
    const score = (correctAnswers / totalQuestions) * 100;
    setJourneyState(prev => ({...prev!, quizScore: score}));
  };
  
  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderJourneyContent = () => {
    if (!journeyState) {
       return <InterestForm onInterestsSubmit={handleInterestsSubmit} />;
    }

    if (isLoading && !journeyState.currentTopic) {
      return <DailyJourneyDisplay isLoading={true} topic={null} material={null} quiz={null} score={null} onQuizSubmit={() => {}} />;
    }
    
    if (journeyState.currentTopic) {
      return (
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">Course Module: {journeyState.journeyTitle}</CardTitle>
                <CardDescription>Day {journeyState.day} of your learning journey.</CardDescription>
            </CardHeader>
          </Card>

          <DailyJourneyDisplay
            topic={journeyState.currentTopic}
            material={journeyState.readingMaterial}
            quiz={journeyState.quiz}
            isLoading={isLoading}
            onQuizSubmit={handleQuizSubmit}
            score={journeyState.quizScore}
          />
          
          {journeyState.quizScore !== null && (
             <Card>
             <CardHeader>
               <CardTitle>End of Day {journeyState.day}</CardTitle>
             </CardHeader>
             <CardContent>
               {journeyState.isCompleted ? (
                 <p>Congratulations! You have completed your learning journey on "{journeyState.journeyTitle}".</p>
               ) : (
                 <p>You've completed today's topic. Come back tomorrow to continue your journey!</p>
               )}
               <div className="mt-6 flex gap-4">
                 {!journeyState.isCompleted && (
                   <Button onClick={advanceToNextDay} disabled={isLoading}>
                      {isLoading ? 'Loading Next Day...' : `Continue to Day ${journeyState.day + 1}`}
                      <ArrowRight className="ml-2" />
                   </Button>
                 )}
                  <Button variant="outline" onClick={startNewJourney}>
                    Start a New Journey
                  </Button>
               </div>
             </CardContent>
           </Card>
          )}
        </div>
      );
    }

    return <InterestForm onInterestsSubmit={handleInterestsSubmit} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header streak={streak} onSignOut={handleSignOut} onHomeClick={startNewJourney} />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            {renderJourneyContent()}
          </div>
          <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
            <GamificationSidebar userStreak={streak} />
          </div>
        </div>
      </main>
    </div>
  );
}
