alter table public.calendar_entries add column title text not null default '' check(length(title)<=160), add column contact_phone text not null default '' check(contact_phone='' or contact_phone ~ '^[0-9]{10,13}$'), add column notes text not null default '' check(length(notes)<=1000), add column source text not null default 'manual' check(source in ('manual','online'));
-- Calendar records and contact information are never granted to anonymous visitors.
-- Existing RLS policies enforce ownership and exclusion constraint serializes overlapping writes.
