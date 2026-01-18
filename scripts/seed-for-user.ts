// Run with: npx tsx scripts/seed-for-user.ts luka@flouence.com
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/seed-for-user.ts <email>');
  process.exit(1);
}

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedForUser() {
  // Find user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .single();

  if (userError || !user) {
    console.error('User not found:', email);
    process.exit(1);
  }

  console.log(`Found user: ${user.id} (role: ${user.role})`);

  // Get patient record for this user
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (patientError || !patient) {
    console.error('No patient record for this user');
    process.exit(1);
  }

  console.log(`Found patient: ${patient.id}`);

  // Get a provider
  let { data: provider } = await supabase
    .from('providers')
    .select('id')
    .limit(1)
    .single();

  if (!provider) {
    console.error('No provider found in database');
    process.exit(1);
  }

  console.log(`Found provider: ${provider.id}`);

  // Check if treatment plan already exists
  const { data: existing } = await supabase
    .from('treatment_plans')
    .select('id')
    .eq('patient_id', patient.id)
    .eq('status', 'active')
    .single();

  if (existing) {
    console.log('Active treatment plan already exists for this patient');
    console.log('ID:', existing.id);
    return;
  }

  // Insert treatment plan
  const { data, error } = await supabase
    .from('treatment_plans')
    .insert({
      patient_id: patient.id,
      provider_id: provider.id,
      status: 'active',
      lifestyle_behaviors: {
        sleep: {
          recommendation: 'Aim for 7-9 hours of quality sleep per night.',
          notes: 'Keep room temperature around 65-68F.'
        },
        stress: {
          recommendation: 'Practice 10 minutes of meditation daily.',
          notes: 'Apps like Headspace can help.'
        },
        habits: [
          { recommendation: 'Limit caffeine after 2 PM', notes: 'Improves sleep quality.' },
          { recommendation: 'Get morning sunlight exposure', notes: 'Regulates circadian rhythm.' }
        ],
        generalNotes: 'Focus on consistent daily routines.'
      },
      nutrition: {
        calories: 2200,
        protein: 180,
        carbs: 200,
        fat: 75,
        guidelines: [
          'Prioritize whole, unprocessed foods',
          'Eat protein with every meal',
          'Stay hydrated - 100oz water daily'
        ],
        restrictions: ['Minimize processed sugar', 'Limit alcohol'],
        generalNotes: 'Starting targets. Will adjust based on progress.'
      },
      training: {
        frequency: '4x per week',
        focus: ['Strength', 'Hypertrophy', 'Mobility'],
        exercises: [
          { name: 'Squats', sets: 4, reps: '6-8', notes: 'Focus on depth' },
          { name: 'Bench Press', sets: 4, reps: '8-10' },
          { name: 'Deadlifts', sets: 3, reps: '5', notes: 'Once per week' },
          { name: 'Pull-ups', sets: 3, reps: '8-12' }
        ],
        generalNotes: 'Rest 2-3 min between sets. Include warmup.'
      },
      prescriptions_data: [
        {
          name: 'Testosterone Cypionate',
          dosage: '200mg/ml',
          frequency: 'Twice weekly',
          timing: 'morning',
          instructions: 'Inject 0.5ml Monday and Thursday'
        }
      ],
      peptides_data: [
        {
          name: 'BPC-157',
          dosage: '250mcg',
          frequency: 'Once daily',
          timing: 'morning',
          injectionSite: 'Subcutaneous',
          instructions: 'Store refrigerated'
        }
      ],
      supplements_data: [
        { name: 'Vitamin D3', dosage: '5000 IU', frequency: 'Daily', timing: 'morning', brand: 'Thorne' },
        { name: 'Omega-3', dosage: '3g', frequency: 'Daily', timing: 'with_food', brand: 'Nordic Naturals' },
        { name: 'Magnesium', dosage: '400mg', frequency: 'Daily', timing: 'before_bed' },
        { name: 'Zinc', dosage: '30mg', frequency: 'Daily', timing: 'evening' }
      ],
      notes: 'Initial treatment plan. Follow-up bloodwork in 8 weeks.'
    })
    .select()
    .single();

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('Treatment plan created!');
  console.log('ID:', data.id);
}

seedForUser();
