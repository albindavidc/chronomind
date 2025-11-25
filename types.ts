export type Tab = 'timer' | 'stopwatch';

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

export interface SmartSuggestion {
  task: string;
  durationSeconds: number;
  reasoning: string;
}