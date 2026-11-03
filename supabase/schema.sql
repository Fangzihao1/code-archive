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
