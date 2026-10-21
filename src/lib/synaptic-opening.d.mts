export const SYNAPTIC_OPENING_DURATION: number;
export interface OpeningFrame { elapsed: number; progress: number; brandOpacity: number; }
export interface SynapticOpeningController {
  readonly elapsed: number;
  play(): void;
  pause(): void;
  resume(): void;
  finish(): void;
  resize(): void;
  setPointer(x: number, y: number): void;
  destroy(): void;
}
export function advanceOpeningClock(elapsed: number, last: number, observed: number | undefined, fallback?: number): { elapsed: number; stamp: number; complete: boolean };
export function createSynapticOpening(canvas: HTMLCanvasElement, options?: { onFrame?: (frame: OpeningFrame) => void; onComplete?: () => void; onError?: (error: unknown) => void }): SynapticOpeningController | null;
