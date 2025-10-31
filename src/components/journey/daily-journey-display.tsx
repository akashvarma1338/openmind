"use client";

import type { GenerateDailyTopicOutput } from "@/ai/flows/generate-daily-topic";
import type { CurateReadingMaterialOutput } from "@/ai/flows/curate-reading-material";
import type { BuildMicroQuizOutput } from "@/ai/flows/build-micro-quiz";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MicroQuiz } from "./micro-quiz";
import { BookOpen, Lightbulb, ListChecks, LinkIcon } from "lucide-react";
import { Separator } from "../ui/separator";

type DailyJourneyDisplayProps = {
  topic: GenerateDailyTopicOutput | null;
  material: CurateReadingMaterialOutput | null;
  quiz: BuildMicroQuizOutput | null;
  isLoading: boolean;
  score: number | null;
  onQuizSubmit: (correct: number, total: number) => void;
};

export function DailyJourneyDisplay({
  topic,
  material,
  quiz,
  isLoading,
  score,
  onQuizSubmit,
}: DailyJourneyDisplayProps) {
  if (isLoading && !topic) {
    return <JourneySkeleton />;
  }

  if (!topic) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/10">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold font-headline text-primary">
            <Lightbulb className="h-8 w-8" />
            Your Daily Topic
          </CardTitle>
          <CardDescription>{topic.reason}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-3xl font-bold">{topic.topic}</h2>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-headline">
            <BookOpen className="h-6 w-6 text-accent" />
            Curated Reading
          </CardTitle>
          <CardDescription>
            Dive into these resources to understand the topic better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !material ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          ) : (
            <div className="space-y-6">
              {material?.articles.map((article, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold text-lg">{article.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {article.concept}
                  </p>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Read more
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-headline">
            <ListChecks className="h-6 w-6 text-accent" />
            Knowledge Check
          </CardTitle>
          <CardDescription>
            Test your understanding with this short quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !quiz ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="space-y-2 pl-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ) : quiz ? (
            <MicroQuiz quiz={quiz.quiz} onSubmit={onQuizSubmit} score={score} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function JourneySkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2 pl-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
