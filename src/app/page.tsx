
"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { InterestForm } from "@/components/onboarding/interest-form";
import { DailyJourneyDisplay } from "@/components/journey/daily-journey-display";
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
import { collection, doc, Timestamp, query, orderBy, limit, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { JourneyHistorySidebar } from "@/components/layout/journey-history-sidebar";

type Journey = {
  id: string;
  title: string;
  startDate: Timestamp;
  topicIds: string[];
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

const isSameDay = (date1: Date, date2: Date) => {
    if (!date1 || !date2) return false;
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
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<{name: string}>(userProfileRef);

  const journeysRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, "users", user.uid, "learning_journeys");
  }, [user, firestore]);

  const userStreakRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "curiosity_points", user.uid);
  }, [user, firestore]);

  const { data: userStreakDoc } = useDoc<{streak: number, timestamp: Timestamp}>(userStreakRef);
  const streak = userStreakDoc?.streak ?? 0;

  // Effect to load the most recent journey
  useEffect(() => {
    if (!journeysRef || !user) return;

    const loadMostRecentJourney = async () => {
      setIsLoading(true);
      const q = query(journeysRef, orderBy("startDate", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const journeyDoc = querySnapshot.docs[0];
        const journeyData = { id: journeyDoc.id, ...journeyDoc.data() } as Journey;

        if (firestore && user) {
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
      }
      setIsLoading(false);
    };

    loadMostRecentJourney();
  }, [journeysRef, user, firestore]);

  const startNewJourney = () => {
    setInterests([]);
    setJourneyState(null);
  };
  
  const handleInterestsSubmit = async (submittedInterests: string[]) => {
    if (isLoading || !user || !firestore || !userProfile) return;
    setIsLoading(true);
    setInterests(submittedInterests);
    setJourneyState(null); // Clear previous journey state

    try {
      const firstTopicAI = await generateDailyTopic({ interests: submittedInterests });
      
      const batch = writeBatch(firestore);

      // Create new journey
      const journeysCollectionRef = collection(firestore, "users", user.uid, "learning_journeys");
      const newJourneyRef = doc(journeysCollectionRef);
      const newJourney: Omit<Journey, 'id'> = {
        title: firstTopicAI.journeyTitle,
        startDate: Timestamp.now(),
        topicIds: [],
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

      // Update streak
      const streakDocRef = doc(firestore, 'curiosity_points', user.uid);
      batch.set(streakDocRef, {
        userId: user.uid,
        userName: userProfile.name, // Denormalize user name
        streak: 1,
        timestamp: serverTimestamp(),
        journeyTitle: firstTopicAI.journeyTitle, // Denormalize journey title
      }, { merge: true });
      
      await batch.commit();

      setJourneyState({
        journey: { ...newJourney, id: newJourneyRef.id },
        currentTopic: { ...newTopic, id: newTopicRef.id },
      });

    } catch (error) {
      console.error("Failed to generate learning journey:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const advanceToNextDay = async () => {
    if (!journeyState || !journeyState.journey || isLoading || !user || !firestore || !userProfile) return;

    setIsLoading(true);
    try {
      const { journey, currentTopic } = journeyState;
      if (!currentTopic || !journey) return;

      const nextTopicAI = await generateDailyTopic({
        interests, // Assuming interests are still in scope or fetched with journey
        journeyTitle: journey.title,
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
      batch.update(journeyRef, { topicIds: [...journey.topicIds, newTopicRef.id] });

      // Update streak
      const currentStreak = userStreakDoc?.streak || 0;
      const lastUpdate = userStreakDoc?.timestamp?.toDate();
      const now = new Date();

      let newStreak = currentStreak;
      if (!lastUpdate || !isSameDay(lastUpdate, now)) {
        newStreak = currentStreak + 1;
        const streakDocRef = doc(firestore, 'curiosity_points', user.uid);
        batch.set(streakDocRef, {
          streak: newStreak,
          timestamp: now,
          userName: userProfile.name, // Keep denormalized name up-to-date
          journeyTitle: journey.title, // Keep denormalized journey title up-to-date
        }, { merge: true });
      }
      
      await batch.commit();

      setJourneyState(prev => {
        if (!prev || !prev.journey) return prev;
        return {
          journey: { ...prev.journey, topicIds: [...prev.journey.topicIds, newTopicRef.id]},
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
  }

  if (isUserLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderJourneyContent = () => {
    if (isLoading && !journeyState) {
      return <LoadingSpinner />;
    }
    
    if (!journeyState) {
       return <InterestForm onInterestsSubmit={handleInterestsSubmit} />;
    }

    const { journey, currentTopic } = journeyState;

    if (isLoading && !currentTopic) {
      return <DailyJourneyDisplay isLoading={true} topic={null} material={null} quiz={null} score={null} onQuizSubmit={() => {}} />;
    }
    
    if (journey && currentTopic) {
      const { readingMaterial, quiz, quizScore, day, title, reason, isLastDay } = currentTopic;
      const topicForDisplay: GenerateDailyTopicOutput = {
          topic: title,
          reason,
          journeyTitle: journey.title,
          isFirstDay: day === 1,
          isLastDay,
      }

      return (
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold font-headline">Course Module: {journey.title}</CardTitle>
                <CardDescription>Day {day} of your learning journey.</CardDescription>
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

    return <InterestForm onInterestsSubmit={handleInterestsSubmit} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header streak={streak} onSignOut={handleSignOut} onHomeClick={startNewJourney} />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0 order-2 lg:order-1">
                {user && <JourneyHistorySidebar user={user} onSelectJourney={handleSelectJourney} />}
            </div>
          <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
            {renderJourneyContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

    