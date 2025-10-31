'use server';

/**
 * @fileOverview A flow for generating a daily learning topic based on user interests.
 *
 * - generateDailyTopic - A function that generates a daily learning topic.
 * - GenerateDailyTopicInput - The input type for the generateDailyTopic function.
 * - GenerateDailyTopicOutput - The return type for the generateDailyTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyTopicInputSchema = z.object({
  interests: z
    .array(z.string())
    .describe('An array of user interests (movies, events, hobbies).'),
});
export type GenerateDailyTopicInput = z.infer<typeof GenerateDailyTopicInputSchema>;

const GenerateDailyTopicOutputSchema = z.object({
  topic: z.string().describe('A relevant and engaging daily learning topic.'),
  reason: z.string().describe('Explanation for why this topic was selected, based on user interests'),
});
export type GenerateDailyTopicOutput = z.infer<typeof GenerateDailyTopicOutputSchema>;

export async function generateDailyTopic(input: GenerateDailyTopicInput): Promise<GenerateDailyTopicOutput> {
  return generateDailyTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyTopicPrompt',
  input: {schema: GenerateDailyTopicInputSchema},
  output: {schema: GenerateDailyTopicOutputSchema},
  prompt: `You are an AI learning companion. You are great at recommending daily topics based on user interests.

  User Interests:
  {{#each interests}}- {{this}}\n{{/each}}

  Generate a relevant and engaging daily learning topic, and explain your choice based on user interests in the topic. The topic should be something that the user can learn about in a short amount of time, and should be relatively self-contained.
  `,
});

const generateDailyTopicFlow = ai.defineFlow(
  {
    name: 'generateDailyTopicFlow',
    inputSchema: GenerateDailyTopicInputSchema,
    outputSchema: GenerateDailyTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
