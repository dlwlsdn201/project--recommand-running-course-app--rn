// src/features/history/hooks/useRunningRecord.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { RunningRecord } from '../types/history.types';

async function fetchRunningRecord(id: string): Promise<RunningRecord> {
  const { data, error } = await supabase
    .from('running_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export function useRunningRecord(id: string) {
  return useQuery({
    queryKey: ['running-record', id],
    queryFn: () => fetchRunningRecord(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
