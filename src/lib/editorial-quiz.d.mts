export interface EditorialQuizOption {
  id: string;
  label: string;
  feedback: string;
  nextStep: string;
}
export interface EditorialQuizQuestion {
  id: string;
  kind?: 'single' | 'multiple' | 'frequency';
  theme: string;
  prompt: string;
  help: string;
  options: EditorialQuizOption[];
  minimum?: number;
  maximum?: number;
  scoreKey?: Record<string, number>;
}
export type EditorialQuizAnswers = Record<string, string | string[]>;
export type EditorialQuizContext = 'personal' | 'company';
export interface EditorialQuizDefinition {
  id: string;
  version: number;
  articleSlug: string;
  title: string;
  introduction: string;
  questions: EditorialQuizQuestion[];
  resultTitle: string;
  resultIntroduction: string;
  resultClosing: string;
  author: string;
  references: { label: string; url: string }[];
  scoring?: { label: string; explanation: string };
  contextIntroductions?: { personal: string; company: string };
}
export interface EditorialQuizReflection {
  quizId: string;
  version: number;
  title: string;
  introduction: string;
  themes: { id: string; title: string; observation: string; nextStep: string }[];
  closing: string;
  context: EditorialQuizContext;
  score?: { value: number; label: string; explanation: string };
}
export function validateQuizAnswers(quiz: EditorialQuizDefinition, answers: EditorialQuizAnswers): {valid: boolean; missing: string[]; invalid: string[]};
export function calculateQuizReflection(quiz: EditorialQuizDefinition, answers: EditorialQuizAnswers, context?: EditorialQuizContext): EditorialQuizReflection;
export function readQuizSession(quiz: EditorialQuizDefinition, raw: string | null): {answers: EditorialQuizAnswers; current: number; completed: boolean; context: EditorialQuizContext} | null;
export function quizReflectionText(quiz: EditorialQuizDefinition, reflection: EditorialQuizReflection): string;
