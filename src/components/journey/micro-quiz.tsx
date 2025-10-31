"use client";

import { useState, useEffect } from "react";
import type { BuildMicroQuizOutput } from "@/ai/flows/build-micro-quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Confetti from "react-confetti";

type QuizQuestion = BuildMicroQuizOutput["quiz"][0];

type MicroQuizProps = {
  quiz: QuizQuestion[];
  onSubmit: (correctAnswers: number, totalQuestions: number) => void;
  score: number | null;
};

export function MicroQuiz({ quiz, onSubmit, score }: MicroQuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(quiz.length).fill(null)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const correctCount = quiz.reduce((count, question, index) => {
      return (
        count + (selectedAnswers[index] === question.correctAnswerIndex ? 1 : 0)
      );
    }, 0);
    const calculatedScore = (correctCount / quiz.length) * 100;
    onSubmit(correctCount, quiz.length);
    setIsSubmitted(true);
    if (calculatedScore >= 80) {
      setShowConfetti(true);
    }
  };

  if (isSubmitted && score !== null) {
    const correctCount = quiz.reduce((count, question, index) => {
      return (
        count +
        (selectedAnswers[index] === question.correctAnswerIndex ? 1 : 0)
      );
    }, 0);

    return (
      <Card className="border-accent relative overflow-hidden">
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>
            You answered {correctCount} out of {quiz.length} questions
            correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Score: {score.toFixed(0)}%
            </span>
            <Progress value={score} className="w-[60%]" />
          </div>
          <div className="space-y-6">
            {quiz.map((q, qIndex) => (
              <div key={qIndex}>
                <p className="font-semibold mb-2">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.answers.map((answer, aIndex) => {
                    const isCorrect = aIndex === q.correctAnswerIndex;
                    const isSelected = aIndex === selectedAnswers[qIndex];
                    return (
                      <div
                        key={aIndex}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md text-sm",
                          isCorrect &&
                            "bg-green-500/10 text-green-700 dark:text-green-400",
                          isSelected &&
                            !isCorrect &&
                            "bg-red-500/10 text-red-700 dark:text-red-400"
                        )}
                      >
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isSelected ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <span>{answer}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {quiz.map((q, qIndex) => (
        <div key={qIndex}>
          <p className="font-semibold mb-3">
            {qIndex + 1}. {q.question}
          </p>
          <RadioGroup
            onValueChange={(value) =>
              handleAnswerChange(qIndex, parseInt(value))
            }
            className="space-y-2"
          >
            {q.answers.map((answer, aIndex) => (
              <div key={aIndex} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={String(aIndex)}
                  id={`q${qIndex}a${aIndex}`}
                />
                <Label
                  htmlFor={`q${qIndex}a${aIndex}`}
                  className="font-normal cursor-pointer"
                >
                  {answer}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={selectedAnswers.includes(null)}
        >
          Submit Quiz <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
