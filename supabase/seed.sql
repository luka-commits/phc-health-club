-- Seed file for test data
-- Run with: npx supabase db execute -f supabase/seed.sql
-- Or paste into Supabase SQL Editor

-- Insert a treatment plan for the first patient with a provider
-- This assumes you have at least one patient and one provider in the system

INSERT INTO treatment_plans (
  patient_id,
  provider_id,
  status,
  lifestyle_behaviors,
  nutrition,
  training,
  prescriptions_data,
  peptides_data,
  supplements_data,
  notes
)
SELECT
  p.id as patient_id,
  pr.id as provider_id,
  'active' as status,
  -- Lifestyle behaviors
  '{
    "sleep": {
      "recommendation": "Aim for 7-9 hours of quality sleep per night. Maintain a consistent sleep schedule.",
      "notes": "Consider blackout curtains and keeping room temperature around 65-68F."
    },
    "stress": {
      "recommendation": "Practice 10 minutes of meditation or deep breathing daily.",
      "notes": "Apps like Headspace or Calm can help establish a routine."
    },
    "habits": [
      {
        "recommendation": "Limit caffeine intake after 2 PM",
        "notes": "This will help improve sleep quality."
      },
      {
        "recommendation": "Get 15-30 minutes of morning sunlight exposure",
        "notes": "Helps regulate circadian rhythm and vitamin D production."
      }
    ],
    "generalNotes": "Focus on establishing consistent daily routines. Small habits compound over time."
  }'::jsonb as lifestyle_behaviors,
  -- Nutrition
  '{
    "calories": 2200,
    "protein": 180,
    "carbs": 200,
    "fat": 75,
    "guidelines": [
      "Prioritize whole, unprocessed foods",
      "Eat protein with every meal (30-40g per meal)",
      "Include vegetables with at least 2 meals daily",
      "Stay hydrated - aim for 100oz water daily"
    ],
    "restrictions": [
      "Minimize processed sugar intake",
      "Limit alcohol to 2 drinks per week maximum"
    ],
    "generalNotes": "These macros are starting targets. We will adjust based on progress and bloodwork results."
  }'::jsonb as nutrition,
  -- Training
  '{
    "frequency": "4x per week",
    "focus": ["Strength", "Hypertrophy", "Mobility"],
    "exercises": [
      {
        "name": "Squats",
        "sets": 4,
        "reps": "6-8",
        "notes": "Focus on depth and controlled eccentric"
      },
      {
        "name": "Bench Press",
        "sets": 4,
        "reps": "8-10",
        "notes": "Full range of motion"
      },
      {
        "name": "Deadlifts",
        "sets": 3,
        "reps": "5",
        "notes": "Once per week, prioritize form"
      },
      {
        "name": "Pull-ups",
        "sets": 3,
        "reps": "8-12",
        "notes": "Use assistance if needed"
      }
    ],
    "generalNotes": "Rest 2-3 minutes between heavy compound sets. Include 10 min warmup and 10 min mobility work."
  }'::jsonb as training,
  -- Prescriptions
  '[
    {
      "name": "Testosterone Cypionate",
      "dosage": "200mg/ml",
      "frequency": "Twice weekly",
      "timing": "morning",
      "instructions": "Inject 0.5ml (100mg) intramuscularly Monday and Thursday mornings"
    },
    {
      "name": "Anastrozole",
      "dosage": "0.5mg",
      "frequency": "As needed",
      "timing": "as_directed",
      "instructions": "Take only if experiencing estrogen-related side effects. Start with 0.25mg twice weekly if needed."
    }
  ]'::jsonb as prescriptions_data,
  -- Peptides
  '[
    {
      "name": "BPC-157",
      "dosage": "250mcg",
      "frequency": "Once daily",
      "timing": "morning",
      "injectionSite": "Subcutaneous, near injury site if applicable",
      "instructions": "Reconstitute with bacteriostatic water. Store refrigerated."
    },
    {
      "name": "Ipamorelin/CJC-1295",
      "dosage": "300mcg each",
      "frequency": "5 days on, 2 days off",
      "timing": "before_bed",
      "injectionSite": "Subcutaneous, abdomen",
      "instructions": "Inject on empty stomach, at least 2 hours after last meal"
    }
  ]'::jsonb as peptides_data,
  -- Supplements
  '[
    {
      "name": "Vitamin D3",
      "dosage": "5000 IU",
      "frequency": "Daily",
      "timing": "morning",
      "brand": "Thorne",
      "instructions": "Take with fatty meal for better absorption"
    },
    {
      "name": "Omega-3 Fish Oil",
      "dosage": "3g EPA/DHA",
      "frequency": "Daily",
      "timing": "with_food",
      "brand": "Nordic Naturals",
      "instructions": "Split into 2 doses with meals"
    },
    {
      "name": "Magnesium Glycinate",
      "dosage": "400mg",
      "frequency": "Daily",
      "timing": "before_bed",
      "brand": "Pure Encapsulations",
      "instructions": "Helps with sleep and recovery"
    },
    {
      "name": "Zinc",
      "dosage": "30mg",
      "frequency": "Daily",
      "timing": "evening",
      "brand": "Thorne",
      "instructions": "Take with food to avoid nausea"
    }
  ]'::jsonb as supplements_data,
  'Initial treatment plan based on intake assessment and baseline bloodwork. Focus areas: optimize hormones, improve body composition, enhance recovery. Schedule follow-up bloodwork in 8 weeks.' as notes
FROM patients p
CROSS JOIN providers pr
LIMIT 1
ON CONFLICT DO NOTHING;
