-- ============================================
-- LITIQO DATABASE SCHEMA
-- ============================================
-- Think of this as the ENGINE BLUEPRINT
-- Each table is a filing cabinet drawer
-- Each row is a file inside that drawer
-- ============================================

-- 1. PROFILES (The Driver's License)
-- Every user who signs up gets a profile
-- This is like the driver's seat — each person has their own
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  firm_name text,
  role text default 'lawyer',  -- lawyer, admin, paralegal
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. CASES (The Main Filing Cabinet)
-- Every legal case lives here
-- When a lawyer creates a case, a new row appears in this table
-- This is the CORE of the engine — everything else connects to it
create table cases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  case_number text not null,
  title text not null,
  case_type text not null,           -- Debt Recovery, Contract Dispute, etc.
  status text default 'New',          -- New, Active, In Progress, Filing Ready, Closed
  priority text default 'Medium',     -- Low, Medium, High, Urgent
  jurisdiction text,                  -- UAE (DIFC), UK (County Court), etc.
  client_name text,
  client_email text,
  client_phone text,
  opposing_party text,
  court_name text,
  judge_name text,
  filing_date date,
  hearing_date date,
  amount numeric default 0,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TIMELINE EVENTS (The Diary/Logbook)
-- Every event that happens in a case gets logged here
-- Think of it as the car's trip computer — records every stop, turn, refuel
create table timeline_events (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases(id) on delete cascade not null,
  event_date date not null,
  title text not null,
  description text,
  event_type text default 'note',    -- filing, hearing, document, communication, milestone, note
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 4. DOCUMENTS (The Glove Box / Document Holder)
-- Every document generated or uploaded for a case
-- The AI (turbo) creates documents, they get stored here
create table documents (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases(id) on delete cascade not null,
  name text not null,
  doc_type text,                     -- Complaint, Motion, Brief, Letter, etc.
  status text default 'Draft',       -- Draft, Final, Generating
  content text,                      -- The actual document text (AI generates this)
  file_url text,                     -- If uploaded as a file, the storage URL
  generated_by_ai boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 5. CLIENT INVITATIONS (The Passenger Pass)
-- When you invite a client to view their case
-- Like giving someone a guest key to sit in the passenger seat
create table client_invitations (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases(id) on delete cascade not null,
  invited_by uuid references profiles(id) not null,
  client_name text not null,
  client_email text not null,
  permissions text[] default '{"View Case Details", "View Documents"}',
  status text default 'Pending',     -- Pending, Accepted, Expired
  access_token text default gen_random_uuid()::text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days')
);

-- 6. NOTIFICATIONS (The Dashboard Warning Lights)
-- Deadline reminders, AI suggestions, client activity
-- Like the car dashboard lights — oil, fuel, engine check
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  message text not null,
  notification_type text not null,   -- deadline, ai_suggestion, client_activity, escalation
  case_id uuid references cases(id) on delete set null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (The Car Lock System)
-- ============================================
-- This ensures each driver can ONLY see their own cases
-- Lawyer A cannot see Lawyer B's cases, even if they try
-- It's like each car having a unique key — your key only opens YOUR car

alter table profiles enable row level security;
alter table cases enable row level security;
alter table timeline_events enable row level security;
alter table documents enable row level security;
alter table client_invitations enable row level security;
alter table notifications enable row level security;

-- Profiles: you can only see and edit your own profile
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Cases: you can only see cases you created
create policy "Users can view own cases"
  on cases for select using (auth.uid() = user_id);
create policy "Users can create cases"
  on cases for insert with check (auth.uid() = user_id);
create policy "Users can update own cases"
  on cases for update using (auth.uid() = user_id);
create policy "Users can delete own cases"
  on cases for delete using (auth.uid() = user_id);

-- Timeline: you can see events for your cases
create policy "Users can view timeline for own cases"
  on timeline_events for select using (
    case_id in (select id from cases where user_id = auth.uid())
  );
create policy "Users can add timeline events to own cases"
  on timeline_events for insert with check (
    case_id in (select id from cases where user_id = auth.uid())
  );

-- Documents: you can see documents for your cases
create policy "Users can view documents for own cases"
  on documents for select using (
    case_id in (select id from cases where user_id = auth.uid())
  );
create policy "Users can add documents to own cases"
  on documents for insert with check (
    case_id in (select id from cases where user_id = auth.uid())
  );

-- Client invitations: you can manage invitations you sent
create policy "Users can view own invitations"
  on client_invitations for select using (auth.uid() = invited_by);
create policy "Users can create invitations"
  on client_invitations for insert with check (auth.uid() = invited_by);

-- Notifications: you can only see your own notifications
create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
-- When someone signs up, automatically create their profile
-- Like the car dealership registering the new owner automatically

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- AUTO-UPDATE TIMESTAMP
-- ============================================
-- Automatically updates the "updated_at" field when a case changes
-- Like the car's mileage counter updating every drive

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at
  before update on cases
  for each row execute function update_updated_at();
