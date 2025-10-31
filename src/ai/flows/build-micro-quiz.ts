
'use server';

/**
 * @fileOverview A micro-quiz builder AI agent.
 *
 * - buildMicroQuiz - A function that handles the quiz building process.
 * - BuildMicroQuizInput - The input type for the buildMicroQuiz function.
 * - BuildMicroQuizOutput - The return type for the buildMicroQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BuildMicroQuizInputSchema = z.object({
  topic: z.string().describe('The daily learning topic.'),
  readingMaterial: z.string().describe('The reading material for the topic.'),
});
export type BuildMicroQuizInput = z.infer<typeof BuildMicroQuizInputSchema>;

const BuildMicroQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      answers: z.array(z.string()).describe('The possible answers to the question.'),
      correctAnswerIndex: z
        .number()
        .describe('The index of the correct answer in the answers array.'),
    })
  ).describe('The generated micro-quiz questions, answers, and correct answer indices.'),
});
export type BuildMicroQuizOutput = z.infer<typeof BuildMicroQuizOutputSchema>;

export async function buildMicroQuiz(input: BuildMicroQuizInput): Promise<BuildMicroQuizOutput> {
  return buildMicroQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'buildMicroQuizPrompt',
  input: {schema: BuildMicroQuizInputSchema},
  output: {schema: BuildMicroQuizOutputSchema},
  prompt: `You are an expert quiz builder, skilled at creating engaging and informative micro-quizzes.

  Based on the daily learning topic and the provided reading material, generate a quiz with multiple choice questions.
  Each question should have 3-5 possible answers, with only one correct answer.

  Topic: {{{topic}}}
  Reading Material: {{{readingMaterial}}}

  Ensure the quiz effectively tests the user's understanding of the material.

  Output the quiz as a JSON array of questions, where each question object has the following format:
  {
    "question": "The question text",
    "answers": ["Answer 1", "Answer 2", "Answer 3", ...],
    "correctAnswerIndex": The index of the correct answer in the answers array (0-based)
  }

  Here is an example:
  [
    {
      "question": "What is the capital of France?",
      "answers": ["Berlin", "Paris", "Rome", "Madrid"],
      "correctAnswerIndex": 1
    },
    {
      "question": "Which planet is known as the Red Planet?",
      "answers": ["Earth", "Mars", "Jupiter", "Venus"],
      "correctAnswerIndex": 1
    }
  ]
  `,
});

const buildMicroQuizFlow = ai.defineFlow(
  {
    name: 'buildMicroQuizFlow',
    inputSchema: BuildMicroQuizInputSchema,
    outputSchema: BuildMicroQuizOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
