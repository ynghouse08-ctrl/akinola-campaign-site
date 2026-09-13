-- Run this once in your Supabase project: SQL Editor > New query > paste > Run

-- 1. Profiles table (extends Supabase's built-in auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  matric_number text,
  jamb_reg_number text,
  level text,
  faculty text,
  department text,
  phone text,
  role text not null default 'student', -- 'student' | 'admin'
  blocked boolean not null default false,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 2. Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, matric_number, jamb_reg_number, level, faculty, department, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'matric_number',
    new.raw_user_meta_data->>'jamb_reg_number',
    new.raw_user_meta_data->>'level',
    new.raw_user_meta_data->>'faculty',
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2b. Look up the email tied to a matric number or JAMB reg number, so
-- students/admins can log in with that instead of typing their email.
-- SECURITY DEFINER lets this bypass RLS just for this one narrow lookup;
-- it only ever returns an email, nothing else.
create or replace function public.email_for_username(p_username text)
returns text as $$
  select u.email::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.matric_number = p_username
     or p.jamb_reg_number = p_username
  limit 1;
$$ language sql security definer set search_path = public;

grant execute on function public.email_for_username(text) to anon, authenticated;

-- 3. GPA / CGPA history
create table if not exists public.gpa_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  label text not null,          -- e.g. "300L Harmattan 2026"
  gpa numeric(4,2),
  cgpa numeric(4,2),
  total_units int,
  created_at timestamp with time zone default now()
);

alter table public.gpa_records enable row level security;

create policy "Users manage own gpa records"
  on public.gpa_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Transport routes (read: any logged-in user, write: admins only)
create table if not exists public.transport_routes (
  id uuid default gen_random_uuid() primary key,
  origin text not null default 'Ado-Ekiti',
  destination text not null,
  park_name text,
  price numeric(10,2) not null,
  updated_at timestamp with time zone default now()
);

alter table public.transport_routes enable row level security;

create policy "Authenticated users can read routes"
  on public.transport_routes for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage routes"
  on public.transport_routes for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 5. Seed sample routes (marked as sample -- confirm real prices before go-live)
insert into public.transport_routes (destination, park_name, price) values
  ('Lagos', 'Park TBC', 12000),
  ('Osun State', 'Park TBC', 7000),
  ('Ibadan', 'Park TBC', 8200),
  ('Abuja', 'Park TBC', 30000),
  ('Ilorin', 'Park TBC', 8000),
  ('Omu Aran', 'Park TBC', 5000),
  ('Otun', 'Park TBC', 3000),
  ('Ekan Nla', 'Park TBC', 4000),
  ('Offa', 'Park TBC', 7000),
  ('Ondo', 'Park TBC', 7200),
  ('Sango', 'Park TBC', 13000),
  ('Ore', 'Park TBC', 9200)
on conflict do nothing;

-- 6. To make yourself the main admin after you register on the site,
-- run this (replace with your real email):
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'your-email@example.com');
