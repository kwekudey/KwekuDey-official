KWEKUDEY SUPABASE WEBSITE — V3

Files:
- index.html       public website
- admin.html       real Supabase login + dashboard
- admin.js         dashboard logic
- admin.css        dashboard styling
- app.js           public-site logic
- style.css        public-site styling
- config.js        Supabase URL + publishable key
- supabase-setup.sql optional compatibility SQL if a missing-column error appears

IMPORTANT:
- The publishable key is safe for browser apps. Never put a Supabase secret key in this site.
- The admin login uses the Supabase Auth user you already created.
- Storage bucket used: kwekudey-medi

GitHub Pages:
Upload all files to the root of the KwekuDey-official repository, replacing the old website files.
Keep the filenames exactly as shown.

If the dashboard says a database column is missing, run supabase-setup.sql once in Supabase SQL Editor.
