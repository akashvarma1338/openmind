
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
  totalDays: z.number().int().describe('The total number of days in the generated learning journey.'),
});
export type GenerateDailyTopicOutput = z.infer<typeof GenerateDailyTopicOutputSchema>;

export async function generateDailyTopic(input: GenerateDailyTopicInput): Promise<GenerateDailyTopicOutput> {
  return generateDailyTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyTopicPrompt',
  input: {schema: GenerateDailyTopicInputSchema},
  output: {schema: GenerateDailyTopicOutputSchema},
  prompt: `You are an AI learning companion. You are great at creating structured, yet engaging learning journeys.

  User Interests:
  {{#each interests}}- {{this}}\n{{/each}}

  {{#if journeyTitle}}
  The user is continuing their learning journey on "{{journeyTitle}}". Generate the next logical topic in this journey.
  The topic should build on previous knowledge but be digestible in a single day.
  Mark "isFirstDay" as false. If you feel this is the final topic to conclude the journey, mark "isLastDay" as true.
  The "totalDays" should remain consistent with the previously established journey length.
  {{else}}
  This is the start of a new journey. First, determine a realistic and appropriate length for a learning journey based on the user's interests. A simple topic might be 7-10 days, while a complex one like "Data Structures" could be 30 or more.
  
  Then, create a broad, engaging title for this learning journey. The title MUST NOT mention a specific duration (e.g., no "in X days").
  
  Finally, generate the very first daily learning topic for Day 1 of this new journey.

  You must provide:
  1. "topic": A relevant and engaging daily learning topic.
  2. "reason": An explanation for why this topic was selected.
  3. "journeyTitle": The title for the overall learning journey.
  4. "isFirstDay": A boolean indicating if this is the first day (should be true).
  5. "isLastDay": A boolean indicating if this is the last day (should be false unless it's a 1-day journey).
  6. "totalDays": The total number of days you have planned for this entire journey.
  {{/if}}
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
