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
import { useUser, useAuth, addDocumentNonBlocking, useFirestore } from "@/firebase";
import AuthPage from "@/app/auth/page";
import { signOut } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { collection, doc } from "firebase/firestore";
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

export default function Home() {
  const [interests, setInterests] = useState<string[]>([]);
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [points, setPoints] = useState(0);

  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

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
    if (isLoading || !firestore) return;
    setIsLoading(true);
    setInterests(submittedInterests);
    setJourneyState(null); // Clear previous journey state

    try {
      // Generate the first topic of a new journey
      const firstTopic = await generateDailyTopic({ interests: submittedInterests });
      
      // Award points for starting
      const initialPoints = 10;
      setPoints(initialPoints);
      
      if(user) {
        const pointsCollection = collection(firestore, 'curiosity_points');
        await addDocumentNonBlocking(pointsCollection, {
          userId: user.uid,
          points: initialPoints,
          timestamp: new Date()
        });
      }


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
    if (!journeyState || !journeyState.journeyTitle || isLoading || !firestore) return;

    setIsLoading(true);
    try {
      const nextTopic = await generateDailyTopic({
        interests,
        journeyTitle: journeyState.journeyTitle,
      });

      const dailyPoints = 10;
      setPoints(prev => prev + dailyPoints);

      if(user) {
        const pointsCollection = collection(firestore, 'curiosity_points');
        await addDocumentNonBlocking(pointsCollection, {
          userId: user.uid,
          points: dailyPoints,
          timestamp: new Date()
        });
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
    if (!firestore) return;
    const score = (correctAnswers / totalQuestions) * 100;
    const earnedPoints = correctAnswers * 5; // 5 points per correct answer
    setPoints(prev => prev + earnedPoints);
    setJourneyState(prev => ({...prev!, quizScore: score}));

    if(user) {
        const pointsCollection = collection(firestore, 'curiosity_points');
        addDocumentNonBlocking(pointsCollection, {
          userId: user.uid,
          points: earnedPoints,
          quizScore: score,
          timestamp: new Date()
        });
    }
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
                <p className="text-muted-foreground">Day {journeyState.day} of your learning journey.</p>
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
      <Header points={points} onSignOut={handleSignOut} />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            {renderJourneyContent()}
          </div>
          <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
            <GamificationSidebar userPoints={points} />
          </div>
        </div>
      </main>
    </div>
  );
}
