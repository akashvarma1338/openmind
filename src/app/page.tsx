"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { InterestForm } from "@/components/onboarding/interest-form";
import { DailyJourneyDisplay } from "@/components/journey/daily-journey-display";
import { GamificationSidebar } from "@/components/layout/gamification-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Home() {
  const [interests, setInterests] = useState<string[]>([]);
  const [dailyTopic, setDailyTopic] =
    useState<GenerateDailyTopicOutput | null>(null);
  const [readingMaterial, setReadingMaterial] =
    useState<CurateReadingMaterialOutput | null>(null);
  const [quiz, setQuiz] = useState<BuildMicroQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [points, setPoints] = useState(0);

  const startNewJourney = () => {
    setInterests([]);
    setDailyTopic(null);
    setReadingMaterial(null);
    setQuiz(null);
    setQuizScore(null);
  };

  const handleInterestsSubmit = async (submittedInterests: string[]) => {
    if (isLoading) return;

    setIsLoading(true);
    setInterests(submittedInterests);
    setDailyTopic(null);
    setReadingMaterial(null);
    setQuiz(null);
    setQuizScore(null);

    try {
      const topic = await generateDailyTopic({ interests: submittedInterests });
      setDailyTopic(topic);
      setPoints((p) => p + 10);

      const material = await curateReadingMaterial({ topic: topic.topic });
      setReadingMaterial(material);

      const fullText = material.articles.join("\n\n");
      const quizData = await buildMicroQuiz({
        topic: topic.topic,
        readingMaterial: fullText,
      });
      setQuiz(quizData);
    } catch (error) {
      console.error("Failed to generate learning journey:", error);
      // You could show a toast notification to the user here.
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = (
    correctAnswers: number,
    totalQuestions: number
  ) => {
    const score = (correctAnswers / totalQuestions) * 100;
    setQuizScore(score);
    setPoints((p) => p + correctAnswers * 5);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header points={points} />
      <main className="flex-1 p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            {!dailyTopic && !isLoading && (
              <InterestForm onInterestsSubmit={handleInterestsSubmit} />
            )}
            {(isLoading || dailyTopic) && (
              <DailyJourneyDisplay
                topic={dailyTopic}
                material={readingMaterial}
                quiz={quiz}
                isLoading={isLoading}
                onQuizSubmit={handleQuizSubmit}
                score={quizScore}
              />
            )}
            {dailyTopic && !isLoading && (
              <div className="text-center">
                <Button onClick={startNewJourney}>
                  Start a New Learning Journey
                </Button>
              </div>
            )}
          </div>
          <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
            <GamificationSidebar userPoints={points} />
          </div>
        </div>
      </main>
    </div>
  );
}
