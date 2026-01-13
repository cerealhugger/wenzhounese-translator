
import { Language, Flashcard } from './types';

export const LANGUAGES: Language[] = [
  { code: 'zh-CN', name: '普通话 (Mandarin)', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'fr-FR', name: '法语 (French)', flag: '🇫🇷' },
  { code: 'it-IT', name: '意大利语 (Italian)', flag: '🇮🇹' },
  { code: 'es-ES', name: '西班牙语 (Spanish)', flag: '🇪🇸' },
];

export const FLASHCARDS: Flashcard[] = [
  { id: '1', mandarin: '你好', category: 'Greetings', image: 'https://picsum.photos/seed/hello/400/300' },
  { id: '2', mandarin: '吃了吗', category: 'Common', image: 'https://picsum.photos/seed/eat/400/300' },
  { id: '3', mandarin: '谢谢', category: 'Common', image: 'https://picsum.photos/seed/thanks/400/300' },
  { id: '4', mandarin: '再见', category: 'Greetings', image: 'https://picsum.photos/seed/bye/400/300' },
];

export const ICONS = {
  Mic: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  ),
  Speaker: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  History: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  ),
  Book: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Check: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
};
