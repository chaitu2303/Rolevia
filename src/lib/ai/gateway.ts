/**
 * Rolevia AI Gateway
 * Provider-independent AI routing with graceful fallbacks.
 * Never call AI providers directly — always use this gateway.
 */

import { generateText, generateObject, LanguageModel } from 'ai';
import { z } from 'zod';
import { getProviderInstance, AIProviderConfig } from './providers';

function getActiveModel(): LanguageModel {
  const currentProvider: AIProviderConfig['provider'] = (process.env.AI_PROVIDER as AIProviderConfig['provider']) || 'local';
  const activeModelName = process.env.LOCAL_AI_MODEL || 'llama3';
  const provider = getProviderInstance({ provider: currentProvider });
  // Dynamic model fallback for testing, default to generic configured model
  if (currentProvider === 'gemini') {
    return provider('gemini-1.5-flash');
  } else if (currentProvider === 'groq') {
    return provider('llama3-8b-8192');
  }
  return provider(activeModelName);
}

export function isAiAvailable(): boolean {
  return process.env.AI_PROVIDER !== 'none' && !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.LOCAL_AI_MODEL);
}

/**
 * Gateway for unstructured generation (text completions).
 */
export async function askGateway(
  prompt: string,
  options?: { systemPrompt?: string; maxTokens?: number }
): Promise<string> {
  if (!isAiAvailable()) {
    throw new Error('AI_PROVIDER_UNAVAILABLE');
  }

  try {
    const { text } = await generateText({
      model: getActiveModel(),
      system: options?.systemPrompt,
      prompt,
      maxOutputTokens: options?.maxTokens ?? 4096,
    });
    return text;
  } catch (err: any) {
    if (err.message === 'AI_PROVIDER_UNAVAILABLE') throw err;
    console.error("Primary AI Gateway failed:", err.message);
    throw new Error(`AI Gateway Error: ${err.message}`);
  }
}

/**
 * Gateway for structured extraction with Zod schema validation and repair.
 */
export async function extractEntities<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options?: { systemPrompt?: string }
): Promise<T> {
  if (!isAiAvailable()) {
    throw new Error('AI_PROVIDER_UNAVAILABLE');
  }

  try {
    const { object } = await generateObject({
      model: getActiveModel(),
      schema,
      system: options?.systemPrompt,
      prompt,
    });
    return object;
  } catch (err: any) {
    if (err.message === 'AI_PROVIDER_UNAVAILABLE') throw err;
    console.error("Primary AI Gateway structured generation failed:", err.message);
    throw new Error(`AI Gateway Structured Generation Error: ${err.message}`);
  }
}
