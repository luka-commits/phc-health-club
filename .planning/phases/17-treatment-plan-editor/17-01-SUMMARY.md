# Plan 17-01: Treatment Plan Server Actions - Summary

## Overview

Created server actions for treatment plan CRUD operations with provider authorization, enabling providers to create, update, and manage treatment plans for patients.

## Completed Tasks

| Task | Status |
|------|--------|
| Task 1: Create treatment plan server actions | Complete |
| Task 2: Add TreatmentPlanUpdateInput type | Complete |

## Changes Made

### New Files
- `src/lib/actions/treatment-plans.ts` - Server actions for treatment plan management

### Modified Files
- `src/types/treatment-plan.ts` - Added TreatmentPlanUpdateInput interface

## Features Implemented

### Server Actions (treatment-plans.ts)

1. **createTreatmentPlan(patientId: string)**
   - Creates new draft treatment plan for a patient
   - Verifies provider authorization (MD can create for any, PA/NP for assigned patients)
   - Checks if treatment plan already exists for patient
   - Initializes with null JSONB sections and draft status
   - Revalidates provider patient paths

2. **updateTreatmentPlan(input: TreatmentPlanUpdateInput)**
   - Updates treatment plan sections (partial update)
   - Validates input with Zod schema
   - Verifies provider owns the plan or is MD/admin
   - Only updates provided fields
   - Sets updated_at timestamp automatically

3. **updateTreatmentPlanStatus(treatmentPlanId, status)**
   - Changes status between draft/active/completed
   - When changing to active: validates at least one section has content
   - Verifies provider authorization

4. **deleteTreatmentPlan(treatmentPlanId)**
   - Deletes draft treatment plans only
   - Prevents deletion of active/completed plans
   - Verifies provider authorization

5. **getTreatmentPlanForPatient(patientId)**
   - Fetches existing treatment plan for a patient
   - Used by editor page for data loading

### TreatmentPlanUpdateInput Type

```typescript
export interface TreatmentPlanUpdateInput {
  treatmentPlanId: string;
  lifestyle_behaviors?: LifestyleData | null;
  nutrition?: NutritionData | null;
  training?: TrainingData | null;
  prescriptions_data?: PrescriptionItem[] | null;
  peptides_data?: PeptideItem[] | null;
  supplements_data?: SupplementItem[] | null;
  notes?: string | null;
}
```

### Authorization Logic

- **MD/Admin**: Full access to all patient treatment plans
- **PA/NP**: Can create first plan for any patient, can only edit plans they own
- All actions check user role and provider license type

## Verification

- [x] `npm run build` succeeds without errors
- [x] All 4 server actions export correctly
- [x] TypeScript types are consistent
- [x] Authorization checks present in all actions
- [x] Zod validation for update input
- [x] Draft/active/completed status workflow supported

## Issues & Resolutions

None encountered.
