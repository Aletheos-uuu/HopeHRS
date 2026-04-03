# Hope, Inc. HR Management System

A web-based HR system built with React, Vite, Tailwind CSS, and Supabase.

## Team Setup Instructions

### 1. Clone the repo
git clone https://github.com/Aletheos-uuu/HopeHRS.git
cd HopeHRS

### 2. Install dependencies
npm install

### 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key (get from M3)

### 4. Run the dev server
npm run dev

## Branching Strategy
- main → production-ready only, never push directly
- dev → stable integration branch, all features merge here
- feature branches → always branch off dev, open PR to merge back into dev

## Branch Naming Convention
- feat/     → new feature
- fix/      → bug fix
- db/       → database changes
- test/     → test files
- docs/     → documentation
- chore/    → config, tooling