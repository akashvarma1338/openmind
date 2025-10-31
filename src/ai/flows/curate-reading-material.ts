'use server';

/**
 * @fileOverview This file contains the Genkit flow for curating reading material based on a daily learning topic.
 *
 * - curateReadingMaterial - A function that curates reading material for a given topic.
 * - CurateReadingMaterialInput - The input type for the curateReadingMaterial function.
 * - CurateReadingMaterialOutput - The return type for the curateReadingMaterial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CurateReadingMaterialInputSchema = z.object({
  topic: z.string().describe('The daily learning topic.'),
  interests: z.array(z.string()).describe('A list of user interests to tailor the explanation (e.g., movies, short stories).'),
});

export type CurateReadingMaterialInput = z.infer<typeof CurateReadingMaterialInputSchema>;

const CurateReadingMaterialOutputSchema = z.object({
  articles: z
    .array(
      z.object({
        title: z.string().describe('The title of the article or resource.'),
        explanation: z
          .string()
          .describe('An explanation of the core concept from the article, tailored to the user\'s interests with an analogy.'),
        link: z.string().url().describe('The URL to the article or resource.'),
      })
    )
    .describe('An array of relevant articles and resources for the topic.'),
});

export type CurateReadingMaterialOutput = z.infer<typeof CurateReadingMaterialOutputSchema>;

export async function curateReadingMaterial(input: CurateReadingMaterialInput): Promise<CurateReadingMaterialOutput> {
  return curateReadingMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'curateReadingMaterialPrompt',
  input: {schema: CurateReadingMaterialInputSchema},
  output: {schema: CurateReadingMaterialOutputSchema},
  prompt: `You are an AI learning companion that excels at making complex topics understandable and engaging.

  Your task is to find relevant articles for a learning topic. For each article, you must analyze its core concept and then explain that concept using a creative analogy based on the user's interests.

  Topic: {{{topic}}}
  User Interests:
  {{#each interests}}- {{this}}\n{{/each}}

  For each resource, provide:
  1.  A title.
  2.  An "explanation" that simplifies the main idea with an analogy related to their interests (e.g., movies, short stories, history).
  3.  A valid URL.`,
});

const curateReadingMaterialFlow = ai.defineFlow(
  {
    name: 'curateReadingMaterialFlow',
    inputSchema: CurateReadingMaterialInputSchema,
    outputSchema: CurateReadingMaterialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
