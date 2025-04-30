// src/ai/flows/extract-package-requirements.ts
'use server';
/**
 * @fileOverview Extracts travel package requirements from chat history.
 *
 * - extractPackageRequirements - A function that extracts package requirements from chat history.
 * - ExtractPackageRequirementsInput - The input type for the extractPackageRequirements function.
 * - ExtractPackageRequirementsOutput - The return type for the extractPackageRequirements function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExtractPackageRequirementsInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The chat history between the user and the travel agent.'),
});
export type ExtractPackageRequirementsInput = z.infer<
  typeof ExtractPackageRequirementsInputSchema
>;

const ExtractPackageRequirementsOutputSchema = z.object({
  destination: z
    .string()
    .optional()
    .describe('The preferred destination of the user.'),
  budget: z.number().optional().describe('The budget of the user.'),
  duration: z.number().optional().describe('The duration of the trip in days.'),
  type: z.string().optional().describe('The type of travel package preferred.'),
});
export type ExtractPackageRequirementsOutput = z.infer<
  typeof ExtractPackageRequirementsOutputSchema
>;

export async function extractPackageRequirements(
  input: ExtractPackageRequirementsInput
): Promise<ExtractPackageRequirementsOutput> {
  return extractPackageRequirementsFlow(input);
}

const extractPackageRequirementsPrompt = ai.definePrompt({
  name: 'extractPackageRequirementsPrompt',
  input: {
    schema: z.object({
      chatHistory: z
        .string()
        .describe('The chat history between the user and the travel agent.'),
    }),
  },
  output: {
    schema: z.object({
      destination: z
        .string()
        .optional()
        .describe('The preferred destination of the user.'),
      budget: z.number().optional().describe('The budget of the user.'),
      duration: z
        .number()
        .optional()
        .describe('The duration of the trip in days.'),
      type: z
        .string()
        .optional()
        .describe('The type of travel package preferred.'),
    }),
  },
  prompt: `You are a travel assistant that analyzes chat history between a user and a travel agent to extract the user's preferences for travel packages.

  Analyze the following chat history and extract the destination, budget, duration, and type of travel package the user is looking for. If a value for a field cannot be determined from the chat history, leave it blank.

  Chat History:
  {{chatHistory}}

  Output in JSON format:
  `,
});

const extractPackageRequirementsFlow = ai.defineFlow<
  typeof ExtractPackageRequirementsInputSchema,
  typeof ExtractPackageRequirementsOutputSchema
>(
  {
    name: 'extractPackageRequirementsFlow',
    inputSchema: ExtractPackageRequirementsInputSchema,
    outputSchema: ExtractPackageRequirementsOutputSchema,
  },
  async input => {
    const {output} = await extractPackageRequirementsPrompt(input);
    return output!;
  }
);
