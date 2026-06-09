export const SAMPLE_SENTENCE = 'See your words. Tap to hear.';

export function sentenceToWords(sentence: string): string[] {
  return sentence ? sentence.split(/\s+/).filter(Boolean) : [];
}

export const SAMPLE_WORDS = sentenceToWords(SAMPLE_SENTENCE);
