-- The platform work (feat/foundation-db) creates its own public.settings and
-- public.rate_limits. The scheduler's tables take the sched_ prefix its
-- functions already use, while both are still empty. Numbered before the
-- platform's 20261015000100 so its migrations still run in order after this one.

alter table settings rename to sched_settings;
alter table sched_settings rename constraint settings_pkey to sched_settings_pkey;
alter table sched_settings rename constraint settings_key_check to sched_settings_key_check;
alter table sched_settings rename constraint settings_value_check to sched_settings_value_check;

alter table rate_limits rename to sched_rate_limits;
alter table sched_rate_limits rename constraint rate_limits_pkey to sched_rate_limits_pkey;
alter table sched_rate_limits rename constraint rate_limits_count_check to sched_rate_limits_count_check;

-- A SQL function names its tables in its body text, so it is replaced to read
-- the new name. Replacing keeps its owner and privileges.
create or replace function sched_export_code(p_space text)
returns table (code text)
language sql stable as $$
  select value from sched_settings where key = 'export_code_' || p_space;
$$;
