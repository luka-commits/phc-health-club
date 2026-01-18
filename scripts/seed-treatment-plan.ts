// Run with: npx tsx scripts/seed-treatment-plan.ts
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local manually
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('placeholder')) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTreatmentPlan() {
  // Get first patient
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .limit(1)
    .single();

  if (patientError || !patient) {
    console.error('No patient found:', patientError?.message);
    process.exit(1);
  }

  // Get first provider, or create one if none exists
  let { data: provider } = await supabase
    .from('providers')
    .select('id')
    .limit(1)
    .single();

  if (!provider) {
    console.log('No provider found, creating test provider...');

    // Check if provider user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'provider@test.com')
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log('Found existing provider user');
    } else {
      // Create a user for the provider
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'provider@test.com',
        password: 'testpassword123',
        email_confirm: true
      });

      if (authError) {
        console.error('Error creating provider user:', authError.message);
        process.exit(1);
      }

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'provider@test.com',
          role: 'provider',
          first_name: 'John',
          last_name: 'Smith'
        });

      if (userError) {
        console.error('Error creating user record:', userError.message);
        process.exit(1);
      }

      userId = authData.user.id;
    }

    // Create provider record
    const { data: newProvider, error: providerError } = await supabase
      .from('providers')
      .insert({
        user_id: userId,
        license_type: 'MD',
        license_number: 'MD123456',
        licensed_states: ['CA', 'NY', 'TX']
      })
      .select()
      .single();

    if (providerError) {
      console.error('Error creating provider:', providerError.message);
      process.exit(1);
    }

    provider = newProvider;
    console.log('Created test provider');
  }

  console.log(`Found patient: ${patient.id}`);
  console.log(`Found provider: ${provider!.id}`);

  // Check if treatment plan already exists
  const { data: existing } = await supabase
    .from('treatment_plans')
    .select('id')
    .eq('patient_id', patient.id)
    .eq('status', 'active')
    .single();

  if (existing) {
    console.log('Active treatment plan already exists, skipping...');
    return;
  }

  // Insert treatment plan
  const { data, error } = await supabase
    .from('treatment_plans')
    .insert({
      patient_id: patient.id,
      provider_id: provider!.id,
      status: 'active',
      lifestyle_behaviors: {
        sleep: {
          recommendation: 'Aim for 7-9 hours of quality sleep per night. Maintain a consistent sleep schedule.',
          notes: 'Consider blackout curtains and keeping room temperature around 65-68F.'
        },
        stress: {
          recommendation: 'Practice 10 minutes of meditation or deep breathing daily.',
          notes: 'Apps like Headspace or Calm can help establish a routine.'
        },
        habits: [
          {
            recommendation: 'Limit caffeine intake after 2 PM',
            notes: 'This will help improve sleep quality.'
          },
          {
            recommendation: 'Get 15-30 minutes of morning sunlight exposure',
            notes: 'Helps regulate circadian rhythm and vitamin D production.'
          }
        ],
        generalNotes: 'Focus on establishing consistent daily routines. Small habits compound over time.'
      },
      nutrition: {
        calories: 2200,
        protein: 180,
        carbs: 200,
        fat: 75,
        guidelines: [
          'Prioritize whole, unprocessed foods',
          'Eat protein with every meal (30-40g per meal)',
          'Include vegetables with at least 2 meals daily',
          'Stay hydrated - aim for 100oz water daily'
        ],
        restrictions: [
          'Minimize processed sugar intake',
          'Limit alcohol to 2 drinks per week maximum'
        ],
        generalNotes: 'These macros are starting targets. We will adjust based on progress and bloodwork results.'
      },
      training: {
        frequency: '4x per week',
        focus: ['Strength', 'Hypertrophy', 'Mobility'],
        exercises: [
          { name: 'Squats', sets: 4, reps: '6-8', notes: 'Focus on depth and controlled eccentric' },
          { name: 'Bench Press', sets: 4, reps: '8-10', notes: 'Full range of motion' },
          { name: 'Deadlifts', sets: 3, reps: '5', notes: 'Once per week, prioritize form' },
          { name: 'Pull-ups', sets: 3, reps: '8-12', notes: 'Use assistance if needed' }
        ],
        generalNotes: 'Rest 2-3 minutes between heavy compound sets. Include 10 min warmup and 10 min mobility work.'
      },
      prescriptions_data: [
        {
          name: 'Testosterone Cypionate',
          dosage: '200mg/ml',
          frequency: 'Twice weekly',
          timing: 'morning',
          instructions: 'Inject 0.5ml (100mg) intramuscularly Monday and Thursday mornings'
        },
        {
          name: 'Anastrozole',
          dosage: '0.5mg',
          frequency: 'As needed',
          timing: 'as_directed',
          instructions: 'Take only if experiencing estrogen-related side effects.'
        }
      ],
      peptides_data: [
        {
          name: 'BPC-157',
          dosage: '250mcg',
          frequency: 'Once daily',
          timing: 'morning',
          injectionSite: 'Subcutaneous, near injury site if applicable',
          instructions: 'Reconstitute with bacteriostatic water. Store refrigerated.'
        },
        {
          name: 'Ipamorelin/CJC-1295',
          dosage: '300mcg each',
          frequency: '5 days on, 2 days off',
          timing: 'before_bed',
          injectionSite: 'Subcutaneous, abdomen',
          instructions: 'Inject on empty stomach, at least 2 hours after last meal'
        }
      ],
      supplements_data: [
        {
          name: 'Vitamin D3',
          dosage: '5000 IU',
          frequency: 'Daily',
          timing: 'morning',
          brand: 'Thorne',
          instructions: 'Take with fatty meal for better absorption'
        },
        {
          name: 'Omega-3 Fish Oil',
          dosage: '3g EPA/DHA',
          frequency: 'Daily',
          timing: 'with_food',
          brand: 'Nordic Naturals',
          instructions: 'Split into 2 doses with meals'
        },
        {
          name: 'Magnesium Glycinate',
          dosage: '400mg',
          frequency: 'Daily',
          timing: 'before_bed',
          brand: 'Pure Encapsulations',
          instructions: 'Helps with sleep and recovery'
        },
        {
          name: 'Zinc',
          dosage: '30mg',
          frequency: 'Daily',
          timing: 'evening',
          brand: 'Thorne',
          instructions: 'Take with food to avoid nausea'
        }
      ],
      notes: 'Initial treatment plan based on intake assessment and baseline bloodwork. Focus areas: optimize hormones, improve body composition, enhance recovery. Schedule follow-up bloodwork in 8 weeks.'
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting treatment plan:', error.message);
    process.exit(1);
  }

  console.log('Treatment plan created successfully!');
  console.log('ID:', data.id);
}

seedTreatmentPlan();
