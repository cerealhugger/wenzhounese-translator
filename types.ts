
export enum AppTab {
  TRANSLATE = 'TRANSLATE',
  LEARN = 'LEARN'
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Flashcard {
  id: string;
  mandarin: string;
  image?: string;
  category: string;
}

export interface TranslationResult {
  wenzhouMandarin: string;
  targetTranslation: string;
  targetAudio?: string; // base64
}
