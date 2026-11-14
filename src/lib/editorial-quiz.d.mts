export interface EditorialQuizOption {
  id: string;
  label: string;
  feedback?: string;
  nextStep?: string;
  points?: number;
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
}
export interface EditorialQuizBand { min: number; max: number; title: string; text: string }
export interface EditorialQuizScoringGroup {
  id: string; title: string; questionIds: string[]; min: number; max: number;
  bands: EditorialQuizBand[]; sourcePages: number[];
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
  source?: { file: string; pages: number[]; label: string };
  scoring?: { kind: 'sum'; groups: EditorialQuizScoringGroup[]; criteria: string; disclaimer: string };
  contextIntroductions?: { personal: string; company: string };
}
export interface EditorialQuizScore {
  id: string; title: string; value: number; min: number; max: number;
  band: EditorialQuizBand; sourcePages: number[];
  calculation: { questionId: string; questionNumber: number; points: number }[];
}
export interface EditorialQuizReflection {
  quizId: string;
  version: number;
  title: string;
  introduction: string;
  themes: { id: string; title: string; observation: string; nextStep: string }[];
  closing: string;
  context: EditorialQuizContext;
  scores?: EditorialQuizScore[];
}
export function validateQuizAnswers(quiz: EditorialQuizDefinition, answers: EditorialQuizAnswers): {valid: boolean; missing: string[]; invalid: string[]};
export function calculateQuizReflection(quiz: EditorialQuizDefinition, answers: EditorialQuizAnswers, context?: EditorialQuizContext): EditorialQuizReflection;
export function resolveQuizScoreGroups(quiz: EditorialQuizDefinition, totals: {groupId: string; total: number}[]): Omit<EditorialQuizScore, 'calculation'>[];
export function readQuizSession(quiz: EditorialQuizDefinition, raw: string | null): {answers: EditorialQuizAnswers; current: number; completed: boolean; context: EditorialQuizContext} | null;
export function quizReflectionText(quiz: EditorialQuizDefinition, reflection: EditorialQuizReflection): string;
