-- KwekuDey website compatibility setup.
-- Run this ONLY if the new dashboard reports a missing-column error.
-- It adds the fields the website expects without deleting your existing data.

alter table public.site_settings add column if not exists bio text default '';
alter table public.site_settings add column if not exists profile_image_url text default '';

alter table public.music add column if not exists image_url text default '';
alter table public.music add column if not exists type text default 'Single';
alter table public.music add column if not exists link text default '';

alter table public.videos add column if not exists link text default '';
alter table public.shows add column if not exists link text default '';
alter table public.social_links add column if not exists url text default '';

-- Make sure the public website can read published content.
alter table public.site_settings enable row level security;
alter table public.music enable row level security;
alter table public.videos enable row level security;
alter table public.shows enable row level security;
alter table public.social_links enable row level security;
