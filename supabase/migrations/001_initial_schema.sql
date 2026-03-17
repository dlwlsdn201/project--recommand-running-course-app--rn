-- RunLoop 초기 스키마
-- PostGIS 익스텐션 활성화 (GIS 쿼리용)
create extension if not exists postgis;

-- ─── profiles 테이블 ───────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  kakao_id    text unique,
  username    text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- RLS 활성화
alter table public.profiles enable row level security;

-- 본인 프로필만 조회 가능
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 본인 프로필만 수정 가능
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── running_records 테이블 ────────────────────────────────────
create table if not exists public.running_records (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references public.profiles(id) on delete cascade not null,
  started_at              timestamptz not null,
  finished_at             timestamptz,
  distance_meters         numeric(10, 2),
  duration_seconds        integer,
  avg_pace_sec_per_km     integer,
  route_geojson           jsonb,         -- 실제 달린 궤적 (GeoJSON LineString)
  planned_route_geojson   jsonb,         -- AI 추천 코스 궤적
  created_at              timestamptz default now() not null
);

-- RLS 활성화
alter table public.running_records enable row level security;

-- 본인 기록만 CRUD 가능
create policy "Users can manage own records"
  on public.running_records for all
  using (auth.uid() = user_id);

-- ─── 신규 유저 가입 시 profile 자동 생성 트리거 ───────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 트리거 등록
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
