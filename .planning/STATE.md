# Project State: PHC Health Club

## Current Position

Phase: 17 of 48 (Treatment Plan Editor)
Plan: 4 of 4 in current phase
Status: Phase 17 complete - autopilot paused by user
Last activity: 2026-01-19 - Phases 15-17 complete (3 phases in autopilot session)

Progress: █████████████████░░░ 35% (17/48 phases complete)

## Milestone Progress

- v1.0 Foundation: 6/6 phases complete
- v1.1 Patient Features: 9/9 phases complete (MILESTONE COMPLETE)
- v1.2 Provider Features: 3/8 phases complete
- v1.3 Communication: 0/6 phases planned
- v1.4 Automation & Integrations: 0/6 phases planned
- v1.5 Billing & Payments: 0/6 phases planned
- v2.0 Video & Polish: 0/8 phases planned

## Accumulated Context

### Key Decisions
- Supabase for Auth and Database
- shadcn/ui for Components
- RLS for HIPAA-Compliance
- Trigger for automatic User/Patient creation
- Server actions return { success: true } | { success: false, error: string }
- Form components receive data via props from server component parent
- Private storage bucket with PDF-only MIME type for HIPAA compliance
- Storage path pattern: {patient_id}/{uuid}.pdf
- Reusable server actions in src/lib/actions/ (vs page-specific in route folders)
- Separate tables for lifestyle_notes (text) and body_metrics (numeric)
- Body measurements stored in imperial units (lbs, inches)
- Provider patient list: MD/Admin see all, PA/NP see assigned only
- Patient detail page: provider-facing view reuses patient components (read-only)
- Intake form data displayed with intelligent grouping and smart type rendering

### Technical Discoveries
- Next.js 16 uses Turbopack
- Middleware convention is deprecated (but works)
- Supabase SSR requires Cookie-Handling
- Zod v4 uses `.issues` instead of `.errors` for validation error access
- zodResolver with Zod v4: avoid .default() in schemas, use form defaultValues instead
- react-big-calendar in Next.js: MUST use controlled state (useState for date/view) or navigation buttons break
- Recharts + React 19: requires react-is@19.2.3 with overrides in package.json
- Recharts components MUST be client components ("use client" directive)
- Client-side search: use debounced state (300ms) with useMemo for filtering
- Lucide icons: title prop not supported, use wrapping span with title attribute

### Blockers/Concerns
- None currently

## Roadmap Evolution

- v1.0 Foundation created: Basis-Setup, Auth, Dashboards (6 phases)
- v1.0 Foundation shipped: 2025-01-18
- Phase 7 complete: Profile Management with functional forms
- Phase 8 complete: Treatment Plan View with display components
- Phase 9 complete: Blood Work History with biomarker charts
- Phase 10 complete: Blood Work Upload (PDF + Manual Entry)
- Phase 11 plan 01 complete: Lifestyle notes and body metrics database schema
- Phase 11 plan 02 complete: Lifestyle notes page with server actions
- Phase 11 plan 03 complete: Body metrics page with charts
- Phase 11.5 complete: Performance & Fitness with PR tracking and training log
- Phase 12 plan 01 complete: Product Catalog with search and detail pages
- Phase 12 plan 02 complete: Goal-based filtering and peptide disclaimers
- Phase 13 plan 01 complete: Refill calendar with list/calendar views and mock prescription data
- Phase 14 plan 01 complete: Blood work schedule page with calendar/list views (verification approved)
- Phase 14 plan 02 complete: Blood work request functionality with dialog and display (verification approved)
- Phase 14 complete: Blood Work Schedule - all patient-initiated request features working
- v1.1 Patient Features milestone complete (phases 7-14 + 11.5)
- 2026-01-18: PRD alignment review - roadmap updated with:
  - Phase 11.5: Performance & Fitness (PRs, training log, nutrition)
  - Phase 30 enhanced: Quest/Labcorp API integration
  - Phase 33 enhanced: HIPAA audit logging
  - Phase 48 added: Gamification & Engagement (Vision Board, badges, streaks)
  - Enhanced Phase 23: Provider vacation/backup handling
- Phase 15 complete: Patient List & Search with role-based visibility
- Phase 16 complete: Patient Detail View with all tabs (4 plans in 2 waves)
- Phase 17 complete: Treatment Plan Editor with CRUD, 6 section editors, patient sign-off (4 plans in 3 waves)

## Session Continuity

Last session: 2026-01-19
Stopped at: Phase 17 complete - autopilot paused by user
Resume file: None
Next: Phase 18 (Blood Work Entry & Schedule)
