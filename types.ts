import type { ReactNode } from 'react';

export type FaqItem = {
  id: string;
  question: string; 
  answer: string;
  icon?: ReactNode;
};

export type AskStatus = 'streaming' | 'done' | 'error';

export type AskedItem = FaqItem & { status: AskStatus };

export type InfinitelyAskedQuestionsProps = {
  items: FaqItem[];
  endpoint?: string;
  askInline?: boolean;
  showAskButton?: boolean;
  thinkingAnimation?: boolean;
  askPrompt?: string;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
  onAsk?: (question: string) => void;
};
