// src/features/history/types/history.types.ts
import type { Database } from '@/shared/api/database.types';

export type RunningRecord = Database['public']['Tables']['running_records']['Row'];

export interface RunningRecordWithColor extends RunningRecord {
  color: string;
}
