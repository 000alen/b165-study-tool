# Task: Auth, Professor Dashboard, Question Rotation

## Context
This is a B165 study tool (Next.js 16, React 19, shadcn/ui, Tailwind). Fully static, all data from `src/data/knowledge-base.json`. Student progress in localStorage. Deployed on Vercel at `sonja-study-tool.vercel.app`.

## Requirements

### 1. Auth Gate (access code for students)
- Add middleware that protects ALL routes except `/` (landing/login page)
- On the root `/` page, show a simple access code input (not a full login — just a code field + "Enter" button)
- Store access code validation in a cookie (e.g., `b165-access=true`, httpOnly not needed since client-side)
- Access code is checked against `NEXT_PUBLIC_ACCESS_CODE` env var
- If env var is NOT set, bypass auth entirely (dev mode / open access)
- Clean, minimal UI — just the tool name, a short tagline, and the code input
- After entering correct code, redirect to `/dashboard` (the student home page — rename current `/` content)
- Wrong code shows inline error "Invalid access code", no page reload

### 2. Role-based routing: Student vs Professor
- Add a second env var: `NEXT_PUBLIC_PROF_CODE`
- On the access code page, if user enters the PROF code, they get professor role. If they enter the student ACCESS code, they get student role
- Store role in the same cookie or a separate one (e.g., `b165-role=student|professor`)
- Create a React context (`src/lib/auth-context.tsx`) that reads the cookie and exposes `{ isAuthenticated, role, logout }`
- Wrap the app layout with this context provider

### 3. Professor Dashboard (`/prof`)
- Only accessible to `role=professor` (redirect students to `/dashboard`)
- Shows aggregated content analytics:
  - Total content stats: X concepts, Y questions, Z cases, W frameworks
  - Content breakdown by session (table: session number, topic, # concepts, # questions, # cases, # frameworks)
  - Content breakdown by LO (which LOs have most/least content)
  - Question type distribution (bar or pie — show how many of each type: conceptual, application, analysis, etc.)
- Note: since there's no server-side student tracking, we can't show real student progress. Show a note: "Student analytics require server-side tracking (coming soon)"
- Clean layout consistent with rest of app

### 4. Nav updates
- Students see: Dashboard, Flashcards, Practice, Cases, Frameworks, Mock Interview, Sessions, LO Map
- Professors see ALL of the above PLUS "Prof Dashboard" link
- Add a small logout button/link in the nav (clears cookie, redirects to `/`)

### 5. Question Rotation / Shuffle
- In `/practice` (PracticePage): add a "Shuffle" button next to the filters
- When clicked, randomize the order of filtered questions (Fisher-Yates shuffle)
- Default order stays as-is (by session). Shuffle is opt-in
- Add a small shuffle icon (🔀 or use lucide `Shuffle` icon)
- In `/flashcards` (FlashcardsPage): same shuffle button behavior
- Shuffle state resets when filters change

### 6. Home page refactor
- Current home page content (stats cards, nav cards, LO progress) moves to `/dashboard`
- New `/` becomes the access code entry page
- Update all internal links accordingly

## Implementation Notes
- Move current `src/app/page.tsx` content to `src/app/dashboard/page.tsx`
- New `src/app/page.tsx` = access code entry
- New `src/app/prof/page.tsx` = professor dashboard
- New `src/lib/auth-context.tsx` = auth context provider
- For cookie handling: use `document.cookie` directly (no need for a cookie library, this is lightweight)
- For middleware: use Next.js `middleware.ts` at `src/middleware.ts`
- Run `pnpm build` at the end to verify no errors

## Do NOT
- Add any backend/database
- Add Google SSO or BetterAuth
- Change the data model or knowledge-base.json
- Add any new npm dependencies (use what's already installed)
