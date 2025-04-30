// 'use server';

/**
 * @fileOverview A travel package suggestion AI agent based on user chat history.
 *
 * - suggestTravelPackages - A function that handles the travel package suggestion process.
 * - SuggestTravelPackagesInput - The input type for the suggestTravelPackages function.
 * - SuggestTravelPackagesOutput - The return type for the suggestTravelPackages function.
 */

'use server';

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { getPackages, TravelPackage } from '@/services/package-service';

const SuggestTravelPackagesInputSchema = z.object({
  chatHistory: z.string().describe('The chat history between the user and the agent.'),
});
export type SuggestTravelPackagesInput = z.infer<typeof SuggestTravelPackagesInputSchema>;

const SuggestTravelPackagesOutputSchema = z.array(z.string()).describe('An array of travel package IDs that match the user preferences.');
export type SuggestTravelPackagesOutput = z.infer<typeof SuggestTravelPackagesOutputSchema>;

export async function suggestTravelPackages(input: SuggestTravelPackagesInput): Promise<SuggestTravelPackagesOutput> {
  return suggestTravelPackagesFlow(input);
}

const extractPreferencesPrompt = ai.definePrompt({
  name: 'extractPreferencesPrompt',
  input: {
    schema: z.object({
      chatHistory: z.string().describe('The chat history between the user and the agent.'),
    }),
  },
  output: {
    schema: z.object({
      destination: z.string().optional().describe('The preferred destination of the user.'),
      budget: z.number().optional().describe('The budget of the user.'),
      duration: z.number().optional().describe('The duration of the trip in days.'),
      type: z.string().optional().describe('The type of the trip (e.g., Adventure, Relaxation).'),
    }),
  },
  prompt: `Given the following chat history, extract the user's preferences for destination, budget, duration, and type of travel package. If a preference is not explicitly mentioned, leave it blank.

Chat History: {{{chatHistory}}}

Preferences:
Destination: {{destination}}
Budget: {{budget}}
Duration: {{duration}}
Type: {{type}}`,
});

const suggestTravelPackagesFlow = ai.defineFlow<
  typeof SuggestTravelPackagesInputSchema,
  typeof SuggestTravelPackagesOutputSchema
>(
  {
    name: 'suggestTravelPackagesFlow',
    inputSchema: SuggestTravelPackagesInputSchema,
    outputSchema: SuggestTravelPackagesOutputSchema,
  },
  async input => {
    const preferences = (await extractPreferencesPrompt(input)).output;

    if (!preferences) {
      console.warn('Could not extract preferences from chat history.');
      return [];
    }

    const packages = await getPackages(
      preferences.destination,
      preferences.budget,
      preferences.duration,
      preferences.type
    );

    const packageIds = packages.map(pkg => pkg.id);
    return packageIds;
  }
);
