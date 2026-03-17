import { create } from 'zustand';
import type { GeneratedCourse } from '../types/route.types';

export type RunningPhase = 'idle' | 'ready' | 'running' | 'paused' | 'finished';

interface LatLng {
  latitude: number;
  longitude: number;
}

interface RunningState {
  phase: RunningPhase;
  plannedCourse: GeneratedCourse | null;
  trackedCoords: LatLng[];
  elapsedSeconds: number;
  distanceMeters: number;
  currentPaceSecPerKm: number;
  startedAt: Date | null;

  setPhase: (phase: RunningPhase) => void;
  setPlannedCourse: (course: GeneratedCourse) => void;
  appendCoord: (coord: LatLng) => void;
  setElapsedSeconds: (seconds: number) => void;
  setDistanceMeters: (meters: number) => void;
  setCurrentPace: (secPerKm: number) => void;
  setStartedAt: (date: Date) => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as RunningPhase,
  plannedCourse: null,
  trackedCoords: [] as LatLng[],
  elapsedSeconds: 0,
  distanceMeters: 0,
  currentPaceSecPerKm: 0,
  startedAt: null,
};

export const useRunningStore = create<RunningState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setPlannedCourse: (course) => set({ plannedCourse: course }),
  appendCoord: (coord) =>
    set((state) => ({ trackedCoords: [...state.trackedCoords, coord] })),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
  setDistanceMeters: (distanceMeters) => set({ distanceMeters }),
  setCurrentPace: (currentPaceSecPerKm) => set({ currentPaceSecPerKm }),
  setStartedAt: (startedAt) => set({ startedAt }),
  reset: () => set(initialState),
}));
