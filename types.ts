
export type Tab = 'timer' | 'sequence' | 'stopwatch' | 'settings';

export type SoundId = 'classic' | 'ethereal' | 'cosmic' | 'zen' | 'digital';

export interface SoundPreset {
  id: SoundId;
  name: string;
  description: string;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  duration: number; // Total duration in seconds
  timeLeft: number; // Remaining time in seconds
  initialDuration: number; // For reset
}

export interface Lap {
  id: number;
  time: number; // milliseconds
  lapTime: number; // milliseconds
}

export interface StopwatchState {
  isActive: boolean;
  startTime: number;
  elapsed: number; // milliseconds
  laps: Lap[];
}
