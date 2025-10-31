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
});

export type CurateReadingMaterialInput = z.infer<typeof CurateReadingMaterialInputSchema>;

const CurateReadingMaterialOutputSchema = z.object({
  articles: z
    .array(z.string())
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
  prompt: `You are an AI assistant that helps users find relevant articles and resources for a given learning topic.

  Topic: {{{topic}}}

  Please provide a list of articles and resources that would be helpful for learning about this topic.
  Return the articles in markdown format.`,
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
