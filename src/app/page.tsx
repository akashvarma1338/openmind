
"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { InterestForm } from "@/components/onboarding/interest-form";
import { DailyJourneyDisplay } from "@/components/journey/daily-journey-display";
import { Button } from "@/components/ui/button";
import {
  generateDailyTopic,
  type GenerateDailyTopicInput,
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
import { useUser, useAuth, setDocumentNonBlocking, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import AuthPage from "@/app/auth/page";
import { signOut } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { collection, doc, Timestamp, query, orderBy, limit, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { JourneyHistorySidebar } from "@/components/layout/journey-history-sidebar";
import { useToast } from "@/hooks/use-toast";
import { ConfettiCelebration } from "@/components/journey/confetti-celebration";


type Journey = {
  id: string;
  title: string;
  startDate: Timestamp;
  topicIds: string[];
  totalDays: number;
};

type Topic = {
  id: string;
  day: number;
  title: string;
  reason: string;
  isFirstDay: boolean;
  isLastDay: boolean;
  readingMaterial: CurateReadingMaterialOutput | null;
  quiz: BuildMicroQuizOutput | null;
  quizScore: number | null;
  createdAt: Timestamp;
}

type JourneyState = {
  journey: Journey | null;
  currentTopic: Topic | null;
};

export default function Home() {
  const [interests, setInterests] = useState<string[]>([]);
  const [journeyState, setJourneyState] = useState<JourneyState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<{streak: number}>(userProfileRef);
  const streak = userProfile?.streak ?? 0;

  // This effect handles both starting a new journey and loading the most recent one.
  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;

    const loadJourney = async () => {
      setIsLoading(true);

      // Priority 1: Check if a pre-generated journey needs to be started.
      const pregenInterestsJSON = localStorage.getItem('pregeneratedJourneyInterests');
      if (pregenInterestsJSON) {
        localStorage.removeItem('pregeneratedJourneyInterests');
        const pregenInterests = JSON.parse(pregenInterestsJSON);
        if (pregenInterests && pregenInterests.length > 0) {
            await handleInterestsSubmit(pregenInterests, true);
            // isLoading is handled inside handleInterestsSubmit for this case
            return;
        }
      }

      // Priority 2: If not starting a new journey, load the most recent one.
      const journeysRef = collection(firestore, "users", user.uid, "learning_journeys");
      const q = query(journeysRef, orderBy("startDate", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const journeyDoc = querySnapshot.docs[0];
        const journeyData = { id: journeyDoc.id, ...journeyDoc.data() } as Journey;

        const topicsRef = collection(firestore, "users", user.uid, "learning_journeys", journeyData.id, "topics");
        const topicsQuery = query(topicsRef, orderBy("day", "desc"), limit(1));
        const topicsSnapshot = await getDocs(topicsQuery);

        if (!topicsSnapshot.empty) {
            const topicDoc = topicsSnapshot.docs[0];
            const topicData = { id: topicDoc.id, ...topicDoc.data() } as Topic;
            setJourneyState({ journey: journeyData, currentTopic: topicData });
        } else {
            setJourneyState({ journey: journeyData, currentTopic: null });
        }
      }
      setIsLoading(false);
    };

    loadJourney();
  }, [isUserLoading, user, firestore]);

  const startNewJourney = () => {
    setInterests([]);
    setJourneyState(null);
  };
  
  const handleInterestsSubmit = async (submittedInterests: string[], fromPregen = false) => {
    if (isLoading || !user || !firestore) return;
    
    // Manage loading state. If it's a pre-generated journey, it's already true.
    if (!fromPregen) {
        setIsLoading(true);
    }
    setInterests(submittedInterests);
    setJourneyState(null); // Clear previous journey state

    try {
      const aiInput: GenerateDailyTopicInput = { interests: submittedInterests };
      const firstTopicAI = await generateDailyTopic(aiInput);
      
      const batch = writeBatch(firestore);

      // Create new journey
      const journeysCollectionRef = collection(firestore, "users", user.uid, "learning_journeys");
      const newJourneyRef = doc(journeysCollectionRef);
      const newJourney: Omit<Journey, 'id'> = {
        title: firstTopicAI.journeyTitle,
        startDate: Timestamp.now(),
        topicIds: [],
        totalDays: firstTopicAI.totalDays,
      };
      batch.set(newJourneyRef, newJourney);
      
      // Generate content for the first topic
      const material = await curateReadingMaterial({ topic: firstTopicAI.topic, interests: submittedInterests });
      const fullText = material.articles.map(a => `${a.title}\n${a.explanation}`).join("\n\n");
      const quizData = await buildMicroQuiz({
        topic: firstTopicAI.topic,
        readingMaterial: fullText,
      });

      // Create first topic
      const newTopicRef = doc(collection(firestore, "users", user.uid, "learning_journeys", newJourneyRef.id, "topics"));
      const newTopic: Omit<Topic, 'id'> = {
          day: 1,
          title: firstTopicAI.topic,
          reason: firstTopicAI.reason,
          isFirstDay: firstTopicAI.isFirstDay,
          isLastDay: firstTopicAI.isLastDay,
          readingMaterial: material,
          quiz: quizData,
          quizScore: null,
          createdAt: Timestamp.now(),
      };
      batch.set(newTopicRef, newTopic);

      // Update journey with topic ID
      batch.update(newJourneyRef, { topicIds: [newTopicRef.id] });
      
      await batch.commit();

      setJourneyState({
        journey: { ...newJourney, id: newJourneyRef.id },
        currentTopic: { ...newTopic, id: newTopicRef.id },
      });

    } catch (error) {
      console.error("Failed to generate learning journey:", error);
    } finally {
      // Only set loading to false here, to ensure it covers the entire async operation.
      setIsLoading(false);
    }
  };

  const advanceToNextDay = async () => {
    if (!journeyState || !journeyState.journey || isLoading || !user || !firestore) return;

    setIsLoading(true);
    try {
      const { journey, currentTopic } = journeyState;
      if (!currentTopic || !journey) return;

      const nextTopicAI = await generateDailyTopic({
        interests, // Assuming interests are still in scope or fetched with journey
        journeyTitle: journey.title,
        totalDays: journey.totalDays,
      });

      const material = await curateReadingMaterial({ topic: nextTopicAI.topic, interests });
      const fullText = material.articles.map(a => `${a.title}\n${a.explanation}`).join("\n\n");
      const quizData = await buildMicroQuiz({
        topic: nextTopicAI.topic,
        readingMaterial: fullText,
      });

      const batch = writeBatch(firestore);

      // Create new topic
      const newTopicRef = doc(collection(firestore, "users", user.uid, "learning_journeys", journey.id, "topics"));
      const newTopic: Omit<Topic, 'id'> = {
          day: currentTopic.day + 1,
          title: nextTopicAI.topic,
          reason: nextTopicAI.reason,
          isFirstDay: nextTopicAI.isFirstDay,
          isLastDay: nextTopicAI.isLastDay,
          readingMaterial: material,
          quiz: quizData,
          quizScore: null,
          createdAt: Timestamp.now(),
      };
      batch.set(newTopicRef, newTopic);

      // Update journey with new topic ID
      const journeyRef = doc(firestore, "users", user.uid, "learning_journeys", journey.id);
      batch.update(journeyRef, { 
          topicIds: [...journey.topicIds, newTopicRef.id],
          totalDays: nextTopicAI.totalDays // Keep total days consistent
      });

      // Update streak
      if (userProfileRef) {
        const newStreak = (userProfile?.streak || 0) + 1;
        batch.update(userProfileRef, { streak: newStreak });
        toast({
            title: "Daily Progression Bonus!",
            description: `Your streak is now ${newStreak}!`,
        });
      }
      
      await batch.commit();

      setJourneyState(prev => {
        if (!prev || !prev.journey) return prev;
        return {
          journey: { ...prev.journey, topicIds: [...prev.journey.topicIds, newTopicRef.id], totalDays: nextTopicAI.totalDays},
          currentTopic: { ...newTopic, id: newTopicRef.id },
        }
      });

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
    if (!firestore || !user || !journeyState || !journeyState.journey || !journeyState.currentTopic) return;
    const score = (correctAnswers / totalQuestions) * 100;
    
    if (score >= 80) {
        setShowConfetti(true);
    }
    
    const topicRef = doc(firestore, "users", user.uid, "learning_journeys", journeyState.journey.id, "topics", journeyState.currentTopic.id);
    setDocumentNonBlocking(topicRef, { quizScore: score }, { merge: true });

    setJourneyState(prev => {
      if (!prev || !prev.currentTopic) return prev;
      return {
      ...prev,
      currentTopic: {
        ...prev.currentTopic,
        quizScore: score,
      }
    }});
  };
  
  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const handleSelectJourney = (journey: Journey, topic: Topic) => {
    setJourneyState({ journey, currentTopic: topic });
    setIsHistoryOpen(false);
  }

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderJourneyContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    if (!journeyState) {
       return (
        <div className="max-w-2xl mx-auto">
            <InterestForm onInterestsSubmit={handleInterestsSubmit} />
        </div>
       );
    }

    const { journey, currentTopic } = journeyState;
    
    if (journey && currentTopic) {
      const { readingMaterial, quiz, quizScore, day, title, reason, isLastDay } = currentTopic;
      const topicForDisplay: GenerateDailyTopicOutput = {
          topic: title,
          reason,
          journeyTitle: journey.title,
          isFirstDay: day === 1,
          isLastDay,
          totalDays: journey.totalDays,
      }

      return (
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">{journey.title}</CardTitle>
                <CardDescription>Day {day} of {journey.totalDays} in your learning journey.</CardDescription>
            </CardHeader>
          </Card>

          <DailyJourneyDisplay
            topic={topicForDisplay}
            material={readingMaterial}
            quiz={quiz}
            isLoading={isLoading}
            onQuizSubmit={handleQuizSubmit}
            score={quizScore}
          />
          
          {quizScore !== null && (
             <Card>
             <CardHeader>
               <CardTitle>End of Day {day}</CardTitle>
             </CardHeader>
             <CardContent>
               {isLastDay ? (
                 <p>Congratulations! You have completed your learning journey on "{journey.title}".</p>
               ) : (
                 <p>You've completed today's topic. Come back tomorrow to continue your journey!</p>
               )}
               <div className="mt-6 flex gap-4">
                 {!isLastDay && (
                   <Button onClick={advanceToNextDay} disabled={isLoading}>
                      {isLoading ? 'Loading Next Day...' : `Continue to Day ${day + 1}`}
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
    
    return (
        <div className="max-w-2xl mx-auto">
            <InterestForm onInterestsSubmit={handleInterestsSubmit} />
        </div>
       );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <ConfettiCelebration active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Header 
        points={streak} 
        onSignOut={handleSignOut} 
        onHomeClick={startNewJourney}
        onHistoryClick={() => setIsHistoryOpen(true)}
      />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            {renderJourneyContent()}
        </div>
      </main>
      {user && (
        <JourneyHistorySidebar 
            user={user} 
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onSelectJourney={handleSelectJourney} 
        />
       )}
    </div>
  );
}
