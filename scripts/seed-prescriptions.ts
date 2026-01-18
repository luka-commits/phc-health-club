// Run with: npx tsx scripts/seed-prescriptions.ts <email>
// Seeds mock prescriptions with refill dates for the calendar view
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/seed-prescriptions.ts <email>');
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

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.includes('placeholder')) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to get date relative to today
function getRelativeDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

async function seedPrescriptions() {
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
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('id')
    .limit(1)
    .single();

  if (providerError || !provider) {
    console.error('No provider found. Run seed-treatment-plan.ts first.');
    process.exit(1);
  }

  console.log(`Found provider: ${provider.id}`);

  // Check for existing products or create them
  let { data: products } = await supabase
    .from('products')
    .select('id, name, type')
    .eq('active', true);

  if (!products || products.length === 0) {
    console.log('No products found. Creating mock products...');

    const mockProducts = [
      {
        name: 'Testosterone Cypionate',
        type: 'rx',
        short_description: 'Injectable testosterone for hormone replacement therapy',
        long_description: 'Testosterone Cypionate is an injectable form of testosterone used in hormone replacement therapy (HRT). It helps restore testosterone levels in men with low T.',
        cost: 150.00,
        dosing_info: '100-200mg per week, split into 2 injections',
        compounding_pharmacies: ['Empower Pharmacy', 'Defy Medical'],
        active: true
      },
      {
        name: 'BPC-157',
        type: 'peptide',
        short_description: 'Body Protection Compound for tissue healing',
        long_description: 'BPC-157 is a synthetic peptide that supports tissue repair and healing. Often used for injury recovery and gut health.',
        cost: 89.00,
        dosing_info: '250-500mcg daily, subcutaneous injection',
        compounding_pharmacies: ['Tailor Made Compounding'],
        active: true
      },
      {
        name: 'Semaglutide',
        type: 'rx',
        short_description: 'GLP-1 receptor agonist for weight management',
        long_description: 'Semaglutide is a GLP-1 receptor agonist that helps with appetite control and blood sugar regulation for weight management.',
        cost: 299.00,
        dosing_info: 'Start 0.25mg weekly, titrate up to 2.4mg',
        compounding_pharmacies: ['Empower Pharmacy', 'Hallandale'],
        active: true
      },
      {
        name: 'Anastrozole',
        type: 'rx',
        short_description: 'Aromatase inhibitor for estrogen management',
        long_description: 'Anastrozole blocks the enzyme aromatase, reducing estrogen conversion. Used alongside TRT to manage estrogen levels.',
        cost: 45.00,
        dosing_info: '0.25-0.5mg twice weekly as needed',
        compounding_pharmacies: ['Any retail pharmacy'],
        active: true
      },
      {
        name: 'Ipamorelin/CJC-1295',
        type: 'peptide',
        short_description: 'Growth hormone releasing peptide combo',
        long_description: 'This peptide combination stimulates natural growth hormone release for improved recovery, sleep, and body composition.',
        cost: 175.00,
        dosing_info: '300mcg each, 5 days on, 2 days off, before bed',
        compounding_pharmacies: ['Tailor Made Compounding', 'Empower Pharmacy'],
        active: true
      }
    ];

    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(mockProducts)
      .select();

    if (insertError) {
      console.error('Error creating products:', insertError.message);
      process.exit(1);
    }

    products = insertedProducts;
    console.log(`Created ${products.length} products`);
  }

  // Check for existing prescriptions
  const { data: existingPrescriptions } = await supabase
    .from('prescriptions')
    .select('id')
    .eq('patient_id', patient.id);

  if (existingPrescriptions && existingPrescriptions.length > 0) {
    console.log(`Found ${existingPrescriptions.length} existing prescriptions. Deleting...`);
    await supabase
      .from('prescriptions')
      .delete()
      .eq('patient_id', patient.id);
  }

  // Create prescriptions with varied refill dates
  const prescriptions = [
    {
      patient_id: patient.id,
      product_id: products.find(p => p.name === 'Testosterone Cypionate')?.id,
      provider_id: provider.id,
      dosage: '200mg/ml - 10ml vial',
      quantity: 1,
      instructions: 'Inject 0.5ml (100mg) intramuscularly Monday and Thursday mornings',
      pharmacy: 'Empower Pharmacy',
      refill_date: getRelativeDate(5), // 5 days from now
      auto_refill: true,
      status: 'active'
    },
    {
      patient_id: patient.id,
      product_id: products.find(p => p.name === 'BPC-157')?.id,
      provider_id: provider.id,
      dosage: '5mg vial',
      quantity: 2,
      instructions: 'Reconstitute with bacteriostatic water. Inject 250mcg subcutaneously daily.',
      pharmacy: 'Tailor Made Compounding',
      refill_date: getRelativeDate(14), // 2 weeks from now
      auto_refill: true,
      status: 'active'
    },
    {
      patient_id: patient.id,
      product_id: products.find(p => p.name === 'Semaglutide')?.id,
      provider_id: provider.id,
      dosage: '2.5mg/ml - 5ml vial',
      quantity: 1,
      instructions: 'Inject 0.5ml (1.25mg) subcutaneously once weekly on Sunday.',
      pharmacy: 'Empower Pharmacy',
      refill_date: getRelativeDate(21), // 3 weeks from now
      auto_refill: false,
      status: 'active'
    },
    {
      patient_id: patient.id,
      product_id: products.find(p => p.name === 'Anastrozole')?.id,
      provider_id: provider.id,
      dosage: '0.5mg tablets - 30 count',
      quantity: 30,
      instructions: 'Take 0.25mg (half tablet) twice weekly if experiencing estrogen symptoms.',
      pharmacy: 'CVS Pharmacy',
      refill_date: getRelativeDate(45), // 6 weeks from now
      auto_refill: true,
      status: 'active'
    },
    {
      patient_id: patient.id,
      product_id: products.find(p => p.name === 'Ipamorelin/CJC-1295')?.id,
      provider_id: provider.id,
      dosage: '10mg combo vial',
      quantity: 1,
      instructions: 'Inject 300mcg of each before bed on empty stomach. 5 days on, 2 days off.',
      pharmacy: 'Tailor Made Compounding',
      refill_date: getRelativeDate(7), // 1 week from now
      auto_refill: true,
      status: 'active'
    }
  ].filter(p => p.product_id); // Filter out any with missing products

  if (prescriptions.length === 0) {
    console.error('No valid prescriptions to insert (missing product IDs)');
    process.exit(1);
  }

  const { data: insertedPrescriptions, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert(prescriptions)
    .select(`
      id,
      dosage,
      refill_date,
      products(name)
    `);

  if (prescriptionError) {
    console.error('Error creating prescriptions:', prescriptionError.message);
    process.exit(1);
  }

  console.log('\nCreated prescriptions:');
  console.log('─'.repeat(60));
  for (const p of insertedPrescriptions) {
    const products = p.products as unknown as { name: string } | null;
    const productName = products?.name || 'Unknown';
    console.log(`  ${productName}`);
    console.log(`    Dosage: ${p.dosage}`);
    console.log(`    Refill Date: ${p.refill_date}`);
    console.log('');
  }

  console.log('─'.repeat(60));
  console.log(`✓ Created ${insertedPrescriptions.length} prescriptions with refill dates`);
  console.log('\nThe calendar should now show refill events!');
}

seedPrescriptions();
