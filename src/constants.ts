export const SAMPLE_SENTENCE = 'Talk. See words. Tap to hear.';

export function sentenceToWords(sentence: string): string[] {
  return sentence ? sentence.split(/\s+/).filter(Boolean) : [];
}

export const SAMPLE_WORDS = sentenceToWords(SAMPLE_SENTENCE);

export const ICON_LISTEN = `${import.meta.env.BASE_URL}icon-listen.png`;
export const ICON_READ = `${import.meta.env.BASE_URL}icon-read.png`;
export const ICON_NEW = `${import.meta.env.BASE_URL}icon-new.png`;
