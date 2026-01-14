import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSetup() {
  console.log('--- Checking Supabase Setup ---');

  // 1. Check Tables
  console.log('\n1. Checking "profiles" table...');
  const { error: tableError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
  
  if (tableError) {
    console.error('❌ Error accessing "profiles" table:', tableError.message);
    console.error('   Hint: Did you run the schema.sql in the Supabase SQL Editor?');
  } else {
    console.log('✅ "profiles" table exists and is accessible.');
  }

  // 2. Create Admin User
  console.log('\n2. Attempting to create admin user (vnimbalkar79@gmail.com)...');
  const email = 'vnimbalkar79@gmail.com';
  const password = '123456';

  // First try to sign in to see if user exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInData.user) {
    console.log('ℹ️ User already exists.');
    if (signInData.session) {
      console.log('✅ User is active and can login.');
    } else {
        // This usually happens if email is not confirmed
       console.log('⚠️ Login successful but no session (Email might not be confirmed).');
    }
  } else {
    // Attempt to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin', // Start as admin
          full_name: 'Admin User',
          phone: '1234567890'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Signup failed:', signUpError.message);
    } else if (signUpData.user) {
      console.log('✅ User created successfully!');
      if (signUpData.user.identities && signUpData.user.identities.length === 0) {
        console.log('⚠️ User already registered but likely not confirmed.');
      } else if (!signUpData.session) {
        console.log('⚠️ User created but email not confirmed. Please check your inbox or disable email confirmation in Supabase dashboard.');
      } else {
        console.log('✅ User created and logged in!');
      }
    }
  }
}

checkSetup();
