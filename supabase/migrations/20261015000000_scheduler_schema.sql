-- Barn venue scheduler schema. Spec: the private workspace design spec, "Data model".
-- Browsers get nothing: every table has row level security on with no policies, and the
-- browser roles (anon, authenticated) hold no table or function privileges.
-- Netlify functions call the sched_* functions below through Supabase's REST API with the
-- secret key, which runs as service_role. Each call is one transaction.

-- Supabase creates these roles. Creating them when missing lets the same file run in tests.
do $$
declare
  role_name text;
begin
  foreach role_name in array array['anon', 'authenticated', 'service_role'] loop
    if not exists (select 1 from pg_roles where rolname = role_name) then
      execute format('create role %I nologin', role_name);
    end if;
  end loop;
  -- Like Supabase's service_role, which the secret key runs as.
  if not exists (select 1 from pg_roles where rolname = 'service_role' and rolbypassrls) then
    alter role service_role bypassrls;
  end if;
end
$$;

create table spaces (
  id smallint primary key,
  slug text not null unique check (slug in ('barn', 'cabin')),
  name text not null
);

create table lodging_feeds (
  id smallint primary key,
  space_id smallint not null references spaces (id),
  source text not null check (source in ('airbnb', 'vrbo')),
  last_success_at timestamptz,
  last_error text check (char_length(last_error) <= 200),
  last_error_at timestamptz,
  -- The first failure since the last success, so an outage is timed from when it began.
  failing_since timestamptz,
  outage_alerted_at timestamptz,
  -- When a sync first saw this feed lose all or most future stays; the next sync confirms or clears it.
  drop_seen_at timestamptz,
  unique (space_id, source)
);

-- The feed link is a secret: it reveals booked dates to anyone holding it.
create table lodging_feed_secrets (
  feed_id smallint primary key references lodging_feeds (id) on delete cascade,
  url text not null check (url like 'https://%' and char_length(url) <= 2000)
);

create table lodging_stays (
  id bigint generated always as identity primary key,
  feed_id smallint not null references lodging_feeds (id) on delete cascade,
  space_id smallint not null references spaces (id),
  uid text not null check (char_length(uid) between 1 and 255),
  check_in date not null,
  check_out date not null,
  synced_at timestamptz not null default now(),
  check (check_out >= check_in)
);
create index lodging_stays_by_space_and_check_out on lodging_stays (space_id, check_out);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  first_day date not null,
  last_day date not null,
  notes text not null default '' check (char_length(notes) <= 2000),
  cabin_override boolean not null default false,
  created_by text not null,
  created_at timestamptz not null default now(),
  check (last_day >= first_day),
  -- D13: two events never share a day.
  exclude using gist (daterange(first_day, last_day, '[]') with &&)
);

-- One row per alert email, so each stay on an event's blocked nights is emailed once.
create table event_stay_alerts (
  event_id uuid not null references events (id) on delete cascade,
  feed_id smallint not null references lodging_feeds (id) on delete cascade,
  stay_uid text not null,
  check_in date not null,
  check_out date not null,
  alerted_at timestamptz not null default now(),
  primary key (event_id, feed_id, stay_uid, check_in, check_out)
);

create table blocks (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '' check (char_length(reason) <= 200),
  check (ends_at > starts_at)
);

create table appointment_types (
  id smallint primary key,
  kind text not null unique check (kind in ('showing', 'call')),
  name text not null,
  duration_min integer not null check (duration_min > 0),
  gap_after_min integer not null check (gap_after_min >= 0),
  notice_min integer not null check (notice_min >= 0),
  window_days integer not null check (window_days > 0),
  step_min integer not null check (step_min > 0),
  needs_barn_free boolean not null
);

create table weekly_hours (
  id bigint generated always as identity primary key,
  type_id smallint not null references appointment_types (id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  type_id smallint not null references appointment_types (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  blocked_until timestamptz not null,
  status text not null default 'active' check (status in ('active', 'canceled')),
  -- Personal data, cleared 12 months after starts_at (D9).
  name text check (char_length(name) <= 200),
  email text check (char_length(email) <= 320),
  phone text check (char_length(phone) <= 40),
  event_date_note text check (char_length(event_date_note) <= 200),
  guest_count integer check (guest_count between 1 and 1000),
  message text check (char_length(message) <= 2000),
  manage_token_hash text not null unique,
  rescheduled_from uuid references appointments (id),
  canceled_at timestamptz,
  cancel_note text check (char_length(cancel_note) <= 500),
  reminder_sent_at timestamptz,
  clash_alerted_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (blocked_until >= ends_at),
  -- One host: no two active appointments overlap, the gap after each included.
  exclude using gist (tstzrange(starts_at, blocked_until) with &&) where (status = 'active')
);

create table admins (
  email text primary key check (email = lower(email) and email like '%_@_%')
);

create table settings (
  key text primary key check (key in ('export_code_barn', 'export_code_cabin')),
  value text not null check (char_length(value) >= 32)
);

create table rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  count integer not null default 1 check (count > 0),
  primary key (key_hash, window_start)
);

insert into spaces (id, slug, name) values
  (1, 'barn', 'The Barn'),
  (2, 'cabin', 'The Cabin');

insert into lodging_feeds (id, space_id, source) values
  (1, 1, 'airbnb'),
  (2, 1, 'vrbo'),
  (3, 2, 'airbnb'),
  (4, 2, 'vrbo');

-- Defaults from the spec's defaults table; lib/scheduling/types.ts DEFAULT_TYPES must match.
insert into appointment_types
  (id, kind, name, duration_min, gap_after_min, notice_min, window_days, step_min, needs_barn_free)
values
  (1, 'showing', 'Venue showing', 60, 30, 1440, 60, 30, true),
  (2, 'call', 'Planning call', 30, 0, 240, 60, 30, false);

alter table spaces enable row level security;
alter table lodging_feeds enable row level security;
alter table lodging_feed_secrets enable row level security;
alter table lodging_stays enable row level security;
alter table events enable row level security;
alter table event_stay_alerts enable row level security;
alter table blocks enable row level security;
alter table appointment_types enable row level security;
alter table weekly_hours enable row level security;
alter table appointments enable row level security;
alter table admins enable row level security;
alter table settings enable row level security;
alter table rate_limits enable row level security;

-- Server functions for the lodging sync and the blocking feeds. Times travel as epoch
-- milliseconds (float8) and dates as YYYY-MM-DD text, so every caller sees the same shapes.

create function sched_configured_feeds()
returns table (id int, space text, source text, url text, drop_seen boolean)
language sql stable as $$
  select f.id::int, s.slug, f.source, x.url, f.drop_seen_at is not null
    from lodging_feeds f
    join spaces s on s.id = f.space_id
    join lodging_feed_secrets x on x.feed_id = f.id
   order by f.id;
$$;

create function sched_feed_health()
returns table (
  id int, space text, source text, last_success_ms float8, last_error_ms float8,
  failing_since_ms float8, outage_alerted boolean
)
language sql stable as $$
  select f.id::int, s.slug, f.source,
         (extract(epoch from f.last_success_at) * 1000)::float8,
         (extract(epoch from f.last_error_at) * 1000)::float8,
         (extract(epoch from f.failing_since) * 1000)::float8,
         f.outage_alerted_at is not null
    from lodging_feeds f
    join spaces s on s.id = f.space_id
    join lodging_feed_secrets x on x.feed_id = f.id
   order by f.id;
$$;

create function sched_count_future_stays(p_feed_id int, p_today date)
returns table (n int)
language sql stable as $$
  select count(*)::int from lodging_stays where feed_id = p_feed_id and check_out >= p_today;
$$;

-- Replaces one feed's stays and marks the feed healthy. p_stays is a JSON array of
-- {"uid", "check_in", "check_out"} objects, passed as text so every caller sends a string.
create function sched_replace_feed_stays(p_feed_id int, p_stays text, p_now_ms float8)
returns void
language sql as $$
  delete from lodging_stays where feed_id = p_feed_id;
  insert into lodging_stays (feed_id, space_id, uid, check_in, check_out, synced_at)
  select f.id, f.space_id, r.uid, r.check_in, r.check_out, to_timestamp(p_now_ms / 1000)
    from lodging_feeds f,
         jsonb_to_recordset(p_stays::jsonb) as r(uid text, check_in date, check_out date)
   where f.id = p_feed_id;
  update lodging_feeds
     set last_success_at = to_timestamp(p_now_ms / 1000), last_error = null, last_error_at = null,
         failing_since = null, outage_alerted_at = null, drop_seen_at = null
   where id = p_feed_id;
$$;

create function sched_record_feed_failure(p_feed_id int, p_message text, p_now_ms float8)
returns void
language sql as $$
  update lodging_feeds
     set last_error = left(p_message, 200), last_error_at = to_timestamp(p_now_ms / 1000),
         failing_since = coalesce(failing_since, to_timestamp(p_now_ms / 1000))
   where id = p_feed_id;
$$;

create function sched_mark_drop_seen(p_feed_id int, p_now_ms float8)
returns void
language sql as $$
  update lodging_feeds set drop_seen_at = to_timestamp(p_now_ms / 1000) where id = p_feed_id;
$$;

create function sched_mark_outage_alerted(p_feed_id int, p_now_ms float8)
returns void
language sql as $$
  update lodging_feeds set outage_alerted_at = to_timestamp(p_now_ms / 1000) where id = p_feed_id;
$$;

create function sched_stays_from(p_from date)
returns table (feed_id int, space text, source text, uid text, check_in text, check_out text)
language sql stable as $$
  select st.feed_id::int, s.slug, f.source, st.uid, st.check_in::text, st.check_out::text
    from lodging_stays st
    join spaces s on s.id = st.space_id
    join lodging_feeds f on f.id = st.feed_id
   where st.check_out >= p_from
   order by st.check_in, st.feed_id, st.uid;
$$;

create function sched_events_from(p_from date)
returns table (id text, title text, first_day text, last_day text, cabin_override boolean)
language sql stable as $$
  select e.id::text, e.title, e.first_day::text, e.last_day::text, e.cabin_override
    from events e
   where e.last_day >= p_from
   order by e.first_day;
$$;

create function sched_future_showings(p_from_ms float8)
returns table (id text, start_ms float8, end_ms float8, blocked_until_ms float8, clash_alerted boolean)
language sql stable as $$
  select a.id::text,
         (extract(epoch from a.starts_at) * 1000)::float8,
         (extract(epoch from a.ends_at) * 1000)::float8,
         (extract(epoch from a.blocked_until) * 1000)::float8,
         a.clash_alerted_at is not null
    from appointments a
    join appointment_types t on t.id = a.type_id
   where a.status = 'active' and t.kind = 'showing' and a.starts_at >= to_timestamp(p_from_ms / 1000)
   order by a.starts_at;
$$;

create function sched_mark_clash_alerted(p_appointment_id uuid, p_now_ms float8)
returns void
language sql as $$
  update appointments set clash_alerted_at = to_timestamp(p_now_ms / 1000)
   where id = p_appointment_id and clash_alerted_at is null;
$$;

create function sched_has_event_stay_alert(
  p_event_id uuid, p_feed_id int, p_uid text, p_check_in date, p_check_out date
)
returns table (found boolean)
language sql stable as $$
  select exists (
    select 1 from event_stay_alerts
     where event_id = p_event_id and feed_id = p_feed_id and stay_uid = p_uid
       and check_in = p_check_in and check_out = p_check_out
  );
$$;

create function sched_record_event_stay_alert(
  p_event_id uuid, p_feed_id int, p_uid text, p_check_in date, p_check_out date, p_now_ms float8
)
returns void
language sql as $$
  insert into event_stay_alerts (event_id, feed_id, stay_uid, check_in, check_out, alerted_at)
  values (p_event_id, p_feed_id, p_uid, p_check_in, p_check_out, to_timestamp(p_now_ms / 1000))
  on conflict do nothing;
$$;

create function sched_export_code(p_space text)
returns table (code text)
language sql stable as $$
  select value from settings where key = 'export_code_' || p_space;
$$;

-- Privileges: browser roles get nothing; service_role (the secret key) gets what the functions need.
revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Supabase hands every new table, sequence and function in public to the browser roles,
-- and Postgres lets everyone run new functions. Take that back for later migrations too,
-- so a forgotten revoke cannot expose a table or function. Each migration still ends with
-- the explicit revoke and grant block above.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;
alter default privileges for role postgres revoke execute on functions from public;
