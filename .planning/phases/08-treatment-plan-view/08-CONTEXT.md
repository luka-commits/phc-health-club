# Phase 8: Treatment Plan View - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<vision>
## How This Should Work

When patients open their treatment plan, they see a clean, organized view of their entire protocol. Each tab (Lifestyle, Nutrition, Training, Prescriptions, Peptides, Supplements) displays its content in formatted cards rather than raw JSON.

The patient can scan their treatment plan and immediately understand what they need to do. No confusion about medications, dosages, or timing.

</vision>

<essential>
## What Must Be Nailed

- **Clarity first** - Patient instantly understands what to take and when. No ambiguity about their protocol.
- **Answer "what do I do today?"** - The design should make daily actions obvious at a glance.

</essential>

<specifics>
## Specific Ideas

- Clean display components for each tab section (replace JSON.stringify)
- Define structured data types for each section (prescriptions, peptides, supplements, etc.)
- Cards with clear formatting for medications and supplements
- Visual timing indicators (morning, evening, with food, etc.)
- Read-only for patients (editing comes in Phase 15 for providers)

</specifics>

<notes>
## Additional Context

The current implementation has all 6 tabs working but displays raw JSON. This phase transforms the data display into a proper patient-facing UI.

Data structure is flexible JSONB - we'll define sensible type structures as part of implementation while keeping compatibility with provider entry in Phase 15.

</notes>

---

*Phase: 08-treatment-plan-view*
*Context gathered: 2026-01-18*
