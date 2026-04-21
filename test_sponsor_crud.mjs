// Quick script to test if sponsor CRUD works
// Run: node test_sponsor_crud.mjs

import { createClient } from '@supabase/supabase-js';

const url = 'https://morlgdmenrphxorhdjaf.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcmxnZG1lbnJwaHhvcmhkamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTQzMjksImV4cCI6MjA4NjQzMDMyOX0.eV3daWt5Do3p4SO9pYhtrcFp3mEN6_qvlWq7RlL-6_o';

const supabase = createClient(url, anon);

// First, sign in
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'italo@teste.com',
  password: '123456',
});

if (authError) {
  console.error('❌ Auth failed:', authError.message);
  process.exit(1);
}
console.log('✅ Logged in as:', authData.user.email);

// Test 1: SELECT sponsors
console.log('\n--- Test SELECT sponsors ---');
const { data: selectData, error: selectError } = await supabase.from('sponsors').select('*');
console.log('SELECT result:', selectError ? `❌ ${selectError.message}` : `✅ ${selectData.length} sponsors`);

// Test 2: INSERT sponsor
console.log('\n--- Test INSERT sponsor ---');
const { data: insertData, error: insertError } = await supabase
  .from('sponsors')
  .insert({ name: 'Test RLS Sponsor', email: 'test@rls.com', phone: '11999990000' })
  .select()
  .single();

if (insertError) {
  console.error('❌ INSERT failed:', insertError.message);
  console.error('   Code:', insertError.code);
  console.error('   Details:', insertError.details);
  console.error('   Hint:', insertError.hint);
} else {
  console.log('✅ INSERT success:', insertData);
  
  // Test 3: DELETE the test sponsor
  console.log('\n--- Test DELETE sponsor ---');
  const { error: deleteError } = await supabase
    .from('sponsors')
    .delete()
    .eq('id', insertData.id);
  console.log('DELETE result:', deleteError ? `❌ ${deleteError.message}` : '✅ success');
}

// Sign out
await supabase.auth.signOut();
console.log('\n✅ Done');
