import type { EditorialQuizDefinition, EditorialQuizReflection } from './editorial-quiz.mjs';
export const EDITORIAL_PRIVACY_VERSION: string;
export const EDITORIAL_SHARE_RECIPIENT: string;
export interface SharingInput {
  quiz: EditorialQuizDefinition; reflection: EditorialQuizReflection;
  pseudonym?: string; ageRange?: string; uf?: string; adultConfirmed: boolean; accepted: boolean;
}
export interface SharingAttempt {
  fingerprint: string;
  payload: { editionSlug: string; quizId: string; quizVersion: number; context: 'personal' | 'company'; result: { groups: {groupId: string; total: number}[] } | { fragments: { themeId: string; observation: string; nextStep: string }[] }; pseudonym: string; ageRange: string; uf: string; adultConfirmed: true; consent: { accepted: true; version: string; id: string; givenAt: string } };
}
export function isSharingEnabled(status: unknown): boolean;
export function readSharingAvailability(fetcher?: typeof fetch): Promise<boolean>;
export function createSharingAttempt(input: SharingInput, previous?: SharingAttempt | null, dependencies?: { uuid?: () => string; now?: () => number }): SharingAttempt;
export function submitSharingAttempt(attempt: SharingAttempt, fetcher?: typeof fetch): Promise<{ accepted: boolean; retry?: boolean; unavailable?: boolean; message: string }>;
