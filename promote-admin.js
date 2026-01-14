import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteToAdmin() {
  const email = 'vnimbalkar79@gmail.com';
  console.log(`Promoting ${email} to admin...`);

  // 1. Get User ID from Supabase Auth (we generally can't query auth.users with anon key, 
  // but we can query public.users if RLS allows or if we login)
  
  // Actually, anon key RLS usually prevents UPDATE on other users. 
  // BUT, I can try to login as that user and hope I can't update myself (security risk if so).
  // OR, I can use the SERVICE_ROLE key if I had it. I don't.
  
  // HOWEVER, I can try to simply SIGN IN as that user (known password)
  // and then see if I can run a specialized function or if I can rely on a security hole?
  // No, I shouldn't rely on security holes.
  
  // Wait, the user has the Supabase Dashboard. 
  // I should instruct them to change the role in the database.
  
  // BUT, I can try to see if my `public.users` table policies allow updates.
  // The schema I gave:
  // CREATE POLICY "Users can update their own profiles" ON public.profiles ...
  // But for 'users' table? 
  // CREATE POLICY "Users can view their own user data" ON public.users ...
  // I did NOT add an UPDATE policy for public.users. So even the user themselves cannot update their role.
  
  console.log("----------------------------------------------------------------");
  console.log("IMPORTANT: I cannot programmatically promote your user to Admin with the 'Anon' key.");
  console.log("You have 2 options:");
  console.log("----------------------------------------------------------------");
  console.log("OPTION 1: Run this SQL in your Supabase Dashboard SQL Editor:");
  console.log(`
      UPDATE public.users 
      SET role = 'admin' 
      WHERE email = '${email}';
  `);
  console.log("----------------------------------------------------------------");
  console.log("OPTION 2: Provide your SERVICE_ROLE key (found in Project Settings -> API).");
  console.log("----------------------------------------------------------------");
}

promoteToAdmin();
