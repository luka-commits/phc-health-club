# Phase 11.5: Performance & Fitness - Context

## Overview
Build the Performance & Fitness tab for patients to track gym PRs, training logs, and basic nutrition.

## PRD Reference
From PRD Section 3.5 (Performance & Fitness):

### 3.5.1 PR (Personal Record) Tracking
- Track gym PRs for major lifts
- Historical view of strength progress

### 3.5.2 Fitness Notes
- Free-form notes about workouts
- Training log

### 3.5.3 Nutrition Tracking
- Basic nutrition logging capability

### 3.5.4 Third-Party Integration (Future)
- Potential integration with STNDRD app
- API connection for automatic data sync

## Key Features
1. **PR Tracking**
   - Major lifts: Squat, Bench Press, Deadlift, Overhead Press, etc.
   - Track weight, reps, date
   - Historical chart showing progress over time (similar to body metrics)

2. **Fitness Notes / Training Log**
   - Free-form notes about workouts
   - Date-based organization
   - Similar pattern to lifestyle notes

3. **Nutrition Tracking (Basic)**
   - Simple daily nutrition notes
   - Optional: Track calories, protein, carbs, fats
   - Keep it simple for MVP - can enhance later

## Technical Approach
- Follow same patterns as Phase 11 (Lifestyle Notes & Body Metrics)
- Reuse `BodyMetricsChart` pattern for PR progress charts
- Reuse `NotesList` pattern for training log

## Database Tables Needed
1. `personal_records` - PR tracking (lift_type, weight, reps, date, patient_id)
2. `fitness_notes` - Training log entries (content, date, patient_id)
3. `nutrition_logs` (optional) - Daily nutrition (date, calories, protein, carbs, fats, notes, patient_id)

## Plans
1. **11.5-01**: Database schema for performance & fitness tables
2. **11.5-02**: PR tracking page with charts + fitness notes

## UI Location
- New nav item in patient sidebar: "Performance & Fitness"
- Route: `/patient/fitness` or `/patient/performance`

## Dependencies
- Phase 11 complete (reuse patterns)
- Recharts already configured
