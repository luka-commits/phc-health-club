# Plan 17-04: Patient Sign-Off Workflow - Summary

## Overview

Implemented patient sign-off workflow for treatment plans, allowing providers to send updated plans to patients and patients to review and sign off before plans become fully active.

## Completed Tasks

| Task | Status |
|------|--------|
| Task 1: Add sign-off tracking to treatment plan actions | Complete |
| Task 2: Create SendPlanDialog component | Complete |
| Task 3: Create patient sign-off page | Complete |

## Changes Made

### New Files
- `src/components/provider/treatment-editor/send-plan-dialog.tsx` - Dialog for sending plan to patient
- `src/components/patient/treatment-plan-signoff.tsx` - Patient sign-off form component
- `src/app/(dashboard)/patient/treatment-plan/signoff/page.tsx` - Patient sign-off page

### Modified Files
- `src/types/database.ts` - Added sent_to_patient_at and patient_signed_off_at fields to TreatmentPlan
- `src/lib/actions/treatment-plans.ts` - Added sendPlanToPatient, signOffTreatmentPlan, getPendingSignOff actions

## Features Implemented

### Database Type Updates (database.ts)

Added to TreatmentPlan interface:
```typescript
sent_to_patient_at: string | null;
patient_signed_off_at: string | null;
```

### New Server Actions (treatment-plans.ts)

1. **sendPlanToPatient(treatmentPlanId)**
   - Verifies treatment plan exists and provider has access
   - Requires plan to be 'active' status
   - Sets sent_to_patient_at timestamp
   - Resets patient_signed_off_at to null (for re-sends)
   - Revalidates patient and provider paths

2. **signOffTreatmentPlan(treatmentPlanId)**
   - Verifies user is patient who owns this plan
   - Requires plan to have been sent (sent_to_patient_at not null)
   - Prevents double sign-off
   - Sets patient_signed_off_at timestamp
   - Revalidates patient paths

3. **getPendingSignOff()**
   - For current patient user
   - Returns treatment plan where sent_to_patient_at not null AND patient_signed_off_at is null
   - Includes provider info with user name for display

### SendPlanDialog Component

**Props**: treatmentPlanId, patientName, isOpen, onClose, isPlanActive

**UI**:
- AlertDialog with confirmation message
- Title: "Send Treatment Plan"
- Description explains patient will need to review and sign off
- Warning if plan not active: "Plan must be published before sending"
- Cancel and Send buttons

**Behavior**:
- On confirm: calls sendPlanToPatient action
- Shows toast on success: "Treatment plan sent to {patientName}"
- Disables button while loading
- Integrated into TreatmentPlanEditor (Send to Patient button for active plans)

### TreatmentPlanSignoff Component

**Props**: treatmentPlan (with provider info), patientName

**UI Structure**:
- Card with "Review Your Treatment Plan" title
- Provider name and sent date in description
- Plan summary with 3 cards:
  - Prescriptions: Icon, count, list of names
  - Peptides: Icon, count, list of names
  - Supplements: Icon, count, list of names
- Protocol badges for lifestyle/nutrition/training if set
- "View Full Treatment Plan" link to /patient/treatment-plan
- Agreement checkbox with personalized text
- "Sign Off on Treatment Plan" button (disabled until checkbox checked)

**Behavior**:
- On sign off: calls signOffTreatmentPlan action
- Shows success toast and redirects to /patient dashboard

### Sign-Off Page (/patient/treatment-plan/signoff)

**Server Component**:
- Authenticates user (redirect if not patient)
- Fetches pending sign-off using getPendingSignOff
- Constructs patient name from user data

**UI States**:
- If no pending sign-off: EmptyState with "No Treatment Plan Awaiting Review"
- If pending: Renders TreatmentPlanSignoff component

## Verification

- [x] `npm run build` succeeds without errors
- [x] Provider can send plan to patient (Send to Patient button)
- [x] Patient can view pending sign-off at /patient/treatment-plan/signoff
- [x] Patient can sign off on plan with checkbox confirmation
- [x] Timestamps recorded correctly (sent_to_patient_at, patient_signed_off_at)
- [x] Revisiting signoff page after sign-off shows empty state
- [x] Re-sending plan resets patient_signed_off_at

## Issues & Resolutions

None encountered.
