// src/features/history/hooks/useRunningHistory.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { RunningRecord } from '../types/history.types';

async function fetchRunningHistory(userId: string): Promise<RunningRecord[]> {
  const { data, error } = await supabase
    .from('running_records')
    .select('*')
    .eq('user_id', userId)
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useRunningHistory() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['running-history', user?.id],
    queryFn: () => fetchRunningHistory(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  });
}
