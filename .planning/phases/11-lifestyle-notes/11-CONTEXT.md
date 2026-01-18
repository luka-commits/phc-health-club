# Phase 11: Lifestyle Notes & Tracking - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<vision>
## How This Should Work

Patients have a dedicated space to track their health journey outside of the provider-prescribed treatment plan. This is **patient-owned content** — they write notes about how they're feeling, track body metrics (weight, measurements), and can see what their provider documented from meetings.

The feature lives as a **standalone page** (`/patient/lifestyle-notes`) separate from the Treatment Plan because:
- Treatment Plan = provider-controlled (read-only for patients)
- Lifestyle Notes = patient-controlled (they write and track)

The focus is on **meeting companion + progress tracker**:
- Notes tied to appointments help providers see context
- Body metrics tracking shows real progress over time
- Patients can add personal notes between meetings

</vision>

<essential>
## What Must Be Nailed

- **Body metrics tracking** — Weight and body circumferences (chest, waist, hip, arm, thigh) with visual charts showing trends over time. In hormone therapy, this is critical to see if treatment is working.
- **Patient note-taking** — Freeform notes patients can write, organized by date. Simple and non-intimidating.
- **Provider notes display** — Patients can see what their provider documented from their meetings (transparency).

</essential>

<specifics>
## Specific Ideas

- Body metrics should have line charts (Recharts already installed from Phase 9)
- Notes organized chronologically, newest first
- Simple form for adding body metrics — don't require all measurements every time
- Provider meeting notes are read-only for patients
- Optional: Vision Board feature (nice-to-have, can defer)

</specifics>

<notes>
## Additional Context

This phase sets up infrastructure that Phase 16 (Patient Detail View) and Phase 22 (Provider Patient Notes & Charts) will build on — providers need to see what patients are tracking.

Database tables needed:
- `lifestyle_notes` — patient freeform notes
- `body_metrics` — weight and circumference measurements
- `meeting_notes` — provider notes from appointments (or extend existing tables)

</notes>

---

*Phase: 11-lifestyle-notes*
*Context gathered: 2026-01-18*
