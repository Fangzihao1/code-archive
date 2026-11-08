create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text, display_name text,
 role text not null default 'member' check(role in ('member','admin')),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using(auth.uid()=id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,email,display_name) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1)));
 return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();


-- Exercise archive and automatic version history.
alter table public.exercises
  add column if not exists archived boolean not null default false;

create table if not exists public.exercise_versions (
  id uuid primary key default gen_random_uuid(),
  exercise_id text,
  original_exercise_id text not null,
  version_number integer not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint exercise_versions_original_version_unique
    unique (original_exercise_id, version_number)
);

create index if not exists exercise_versions_exercise_created_idx
  on public.exercise_versions (original_exercise_id, created_at desc);

alter table public.exercise_versions enable row level security;
revoke all on public.exercise_versions from anon, public;
grant select, insert, delete on public.exercise_versions to authenticated;

drop policy if exists "Admins can read exercise versions" on public.exercise_versions;
create policy "Admins can read exercise versions"
  on public.exercise_versions for select to authenticated
  using ((select auth.uid()) = any (array[
    '434cba7d-ea37-41b0-ba55-2f72ec65bc3a'::uuid,
    '96ea8313-e433-4813-9d46-f320cb773be6'::uuid
  ]));

drop policy if exists "Admins can create exercise versions" on public.exercise_versions;
create policy "Admins can create exercise versions"
  on public.exercise_versions for insert to authenticated
  with check ((select auth.uid()) = any (array[
    '434cba7d-ea37-41b0-ba55-2f72ec65bc3a'::uuid,
    '96ea8313-e433-4813-9d46-f320cb773be6'::uuid
  ]));

drop policy if exists "Admins can delete exercise versions" on public.exercise_versions;
create policy "Admins can delete exercise versions"
  on public.exercise_versions for delete to authenticated
  using ((select auth.uid()) = any (array[
    '434cba7d-ea37-41b0-ba55-2f72ec65bc3a'::uuid,
    '96ea8313-e433-4813-9d46-f320cb773be6'::uuid
  ]));

create or replace function public.capture_exercise_version()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  next_version integer;
begin
  if TG_OP = 'INSERT' then
    insert into public.exercise_versions (
      exercise_id, original_exercise_id, version_number, snapshot, created_by
    ) values (
      NEW.id, NEW.id, 1, to_jsonb(NEW), auth.uid()
    );
    return NEW;
  end if;

  if (to_jsonb(NEW) - 'updated_at') is distinct from (to_jsonb(OLD) - 'updated_at') then
    select coalesce(max(version_number), 0) + 1
      into next_version
      from public.exercise_versions
      where original_exercise_id = OLD.id;

    insert into public.exercise_versions (
      exercise_id, original_exercise_id, version_number, snapshot, created_by
    ) values (
      NEW.id, OLD.id, next_version, to_jsonb(OLD), auth.uid()
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists capture_exercise_version_after_write on public.exercises;
create trigger capture_exercise_version_after_write
  after insert or update on public.exercises
  for each row execute function public.capture_exercise_version();

-- Seed a baseline snapshot for records that existed before version history was enabled.
insert into public.exercise_versions (
  exercise_id, original_exercise_id, version_number, snapshot, created_by
)
select e.id, e.id, 1, to_jsonb(e), null
from public.exercises e
where not exists (
  select 1 from public.exercise_versions v
  where v.original_exercise_id = e.id
);
