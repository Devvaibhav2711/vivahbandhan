import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

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
    if (tableError.code === '42P01') {
         console.error('   Specific Error: Table does not exist (42P01).');
         console.error('   ACTION REQUIRED: You must run the SQL in supabase/schema.sql in your Supabase Dashboard.');
    } else {
         console.error('   Hint: Did you run the schema.sql in the Supabase SQL Editor?');
    }
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
    if (signInData.session) {
      console.log('✅ User already exists and login works!');
    } else {
       console.log('⚠️ User exists but login failed to create session.'); 
       console.log('   Likely cause: Email not confirmed.');
       console.log('   ACTION REQUIRED: Go to Supabase Dashboard -> Authentication -> Providers -> Email -> Disable "Confirm email".');
    }
  } else {
    // Attempt to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin',
          full_name: 'Admin User',
          phone: '1234567890'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Signup failed:', signUpError.message);
    } else if (signUpData.user) {
      console.log('✅ Signup request sent successfully!');
      if (!signUpData.session) {
        console.log('⚠️ User created but email not confirmed.');
        console.log('   ACTION REQUIRED: Go to Supabase Dashboard -> Authentication -> Providers -> Email -> Disable "Confirm email".');
      } else {
        console.log('✅ User created and logged in!');
      }
    }
  }
}

checkSetup();
