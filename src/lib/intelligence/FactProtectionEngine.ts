import { z } from 'zod';

export interface FactCheckRequest {
  generatedText: string;
  sourceContext: string; // The original resume or profile text
}

export interface FactCheckResult {
  isSupported: boolean;
  unsupportedClaims: Array<{
    claim: string;
    type: 'metric' | 'skill' | 'experience' | 'title' | 'other';
    confidence: number;
    explanation: string;
  }>;
}

// In a real implementation, this would call an LLM with strict instructions
// to verify if claims in `generatedText` are supported by `sourceContext`.
export async function runFactProtection(req: FactCheckRequest): Promise<FactCheckResult> {
  // Stub for now. Ideally calls AI Gateway.
  
  // A naive implementation to simulate protection
  const unsupportedClaims: FactCheckResult['unsupportedClaims'] = [];
  
  // If the generated text contains numbers not present in source
  const generatedNumbers: string[] = req.generatedText.match(/\d+/g) || [];
  const sourceNumbers: string[] = req.sourceContext.match(/\d+/g) || [];
  
  for (const num of generatedNumbers) {
    if (!sourceNumbers.includes(num) && parseInt(num) > 10) {
      unsupportedClaims.push({
        claim: `Contains unsupported number: ${num}`,
        type: 'metric' as const,
        confidence: 0.8,
        explanation: `The metric ${num} does not appear in the original text.`
      });
    }
  }

  return {
    isSupported: unsupportedClaims.length === 0,
    unsupportedClaims
  };
}
