-- Run this in the Supabase SQL editor to set up the waitlist table.
-- Dashboard → SQL Editor → New query → paste → Run

create table if not exists public.waitlist (
  id            uuid        primary key default gen_random_uuid(),
  email         text        not null,
  name          text,
  referral_code text        not null unique,
  referred_by   text,
  source        text        not null default 'landing',
  created_at    timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

-- Only the edge function (service role) can read/write — no direct client access
alter table public.waitlist enable row level security;

-- No RLS policies: all access goes through the edge function with service role key
