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
  journeyTitle: z.string().optional().describe('The title of the overall learning journey, if it exists.'),
});
export type GenerateDailyTopicInput = z.infer<typeof GenerateDailyTopicInputSchema>;

const GenerateDailyTopicOutputSchema = z.object({
  topic: z.string().describe('A relevant and engaging daily learning topic.'),
  reason: z.string().describe('Explanation for why this topic was selected, based on user interests'),
  journeyTitle: z.string().describe('The title of the learning journey this topic belongs to.'),
  isFirstDay: z.boolean().describe('Whether this is the first topic in the journey.'),
  isLastDay: z.boolean().describe('Whether this is the last topic in the journey.'),
});
export type GenerateDailyTopicOutput = z.infer<typeof GenerateDailyTopicOutputSchema>;

export async function generateDailyTopic(input: GenerateDailyTopicInput): Promise<GenerateDailyTopicOutput> {
  return generateDailyTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyTopicPrompt',
  input: {schema: GenerateDailyTopicInputSchema},
  output: {schema: GenerateDailyTopicOutputSchema},
  prompt: `You are an AI learning companion. You are great at creating structured, open-ended learning journeys that can span many days.

  User Interests:
  {{#each interests}}- {{this}}\n{{/each}}

  {{#if journeyTitle}}
  The user is continuing their learning journey on "{{journeyTitle}}". Generate the next logical topic in this journey.
  The topic should build on previous knowledge but be digestible in a single day.
  Mark "isFirstDay" as false. If you feel this is the final topic to conclude the journey, mark "isLastDay" as true.
  {{else}}
  This is the start of a new journey. Generate a broad, engaging title for a learning journey based on the user's interests.
  Then, generate the very first daily learning topic for Day 1 of this new journey.
  Mark "isFirstDay" as true and "isLastDay" as false.
  {{/if}}
  
  For the generated topic, provide:
  1. "topic": A relevant and engaging daily learning topic.
  2. "reason": An explanation for why this topic was selected.
  3. "journeyTitle": The title for the overall learning journey.
  4. "isFirstDay": A boolean indicating if this is the first day.
  5. "isLastDay": A boolean indicating if this is the last day.
  `,
});

const generateDailyTopicFlow = ai.defineFlow(
  {
    name: 'generateDailyTopicFlow',
    inputSchema: GenerateDailyTopicInputSchema,
    outputSchema: GenerateDailyTopicOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
