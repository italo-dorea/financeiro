// Comprehensive RLS + CRUD test for all tables
// Run: node test_rls_crud_all.mjs

import { createClient } from '@supabase/supabase-js';

const url = 'https://morlgdmenrphxorhdjaf.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcmxnZG1lbnJwaHhvcmhkamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTQzMjksImV4cCI6MjA4NjQzMDMyOX0.eV3daWt5Do3p4SO9pYhtrcFp3mEN6_qvlWq7RlL-6_o';

const results = [];
let totalPass = 0;
let totalFail = 0;
let totalWarn = 0;

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

function record(table, operation, status, detail) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  if (status === 'PASS') totalPass++;
  else if (status === 'FAIL') totalFail++;
  else totalWarn++;
  results.push({ table, operation, status, detail });
  log(icon, `[${table}] ${operation}: ${detail}`);
}

// ============================================================
// 1. TEST UNAUTHENTICATED ACCESS (should be blocked by RLS)
// ============================================================
async function testUnauthenticated() {
  console.log('\n' + '='.repeat(60));
  console.log('🔒 TEST 1: UNAUTHENTICATED ACCESS (should be BLOCKED)');
  console.log('='.repeat(60));

  const anonClient = createClient(url, anon);

  const tables = ['sponsors', 'families', 'bill_occurrences', 'bill_rules', 'user_roles'];

  for (const table of tables) {
    const { data, error } = await anonClient.from(table).select('*').limit(1);

    if (error) {
      record(table, 'ANON SELECT', 'PASS', `Blocked as expected: ${error.message}`);
    } else if (data && data.length >= 0) {
      // If RLS is properly configured for authenticated only, anon should get empty or error
      // With anon key + no session, the role is 'anon'
      // If we get data back, it means either RLS is off or policies allow public/anon
      if (data.length > 0) {
        record(table, 'ANON SELECT', 'FAIL', `⚠️ SECURITY: Returned ${data.length} rows to unauthenticated user!`);
      } else {
        // 0 rows could mean RLS blocked it (returns empty) or table is just empty
        record(table, 'ANON SELECT', 'WARN', `Returned 0 rows (could be RLS blocking or empty table)`);
      }
    }

    // Try INSERT as anon
    const { error: insertErr } = await anonClient
      .from(table)
      .insert({ name: 'ANON_HACKER_TEST' });

    if (insertErr) {
      record(table, 'ANON INSERT', 'PASS', `Blocked: ${insertErr.message}`);
    } else {
      record(table, 'ANON INSERT', 'FAIL', `⚠️ SECURITY: Anon user was able to INSERT!`);
      // Clean up
      await anonClient.from(table).delete().eq('name', 'ANON_HACKER_TEST');
    }
  }
}

// ============================================================
// 2. TEST AUTHENTICATED CRUD
// ============================================================
async function testAuthenticatedCrud() {
  console.log('\n' + '='.repeat(60));
  console.log('🔑 TEST 2: AUTHENTICATED CRUD');
  console.log('='.repeat(60));

  const supabase = createClient(url, anon);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'gabriela.dinis@panahgah.org',
    password: 'panagah2026',
  });

  if (authError) {
    log('❌', `Auth failed: ${authError.message}`);
    process.exit(1);
  }
  log('✅', `Logged in as: ${authData.user.email}`);

  // ---- SPONSORS (full CRUD) ----
  console.log('\n--- SPONSORS ---');

  // SELECT
  const { data: sponsors, error: selSponsor } = await supabase.from('sponsors').select('*');
  if (selSponsor) {
    record('sponsors', 'AUTH SELECT', 'FAIL', selSponsor.message);
  } else {
    record('sponsors', 'AUTH SELECT', 'PASS', `Returned ${sponsors.length} rows`);
  }

  // INSERT
  const { data: newSponsor, error: insSponsor } = await supabase
    .from('sponsors')
    .insert({ name: 'Test CRUD Sponsor', email: 'crud@test.com', phone: '99999999999' })
    .select()
    .single();

  if (insSponsor) {
    record('sponsors', 'AUTH INSERT', 'FAIL', insSponsor.message);
  } else {
    record('sponsors', 'AUTH INSERT', 'PASS', `Created id: ${newSponsor.id}`);

    // UPDATE
    const { error: updSponsor } = await supabase
      .from('sponsors')
      .update({ name: 'Test CRUD Sponsor UPDATED' })
      .eq('id', newSponsor.id);

    if (updSponsor) {
      record('sponsors', 'AUTH UPDATE', 'FAIL', updSponsor.message);
    } else {
      record('sponsors', 'AUTH UPDATE', 'PASS', 'Updated name successfully');
    }

    // DELETE
    const { error: delSponsor } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', newSponsor.id);

    if (delSponsor) {
      record('sponsors', 'AUTH DELETE', 'FAIL', delSponsor.message);
    } else {
      record('sponsors', 'AUTH DELETE', 'PASS', 'Deleted test record');
    }
  }

  // ---- FAMILIES (full CRUD) ----
  console.log('\n--- FAMILIES ---');

  const { data: families, error: selFam } = await supabase.from('families').select('*');
  if (selFam) {
    record('families', 'AUTH SELECT', 'FAIL', selFam.message);
  } else {
    record('families', 'AUTH SELECT', 'PASS', `Returned ${families.length} rows`);
  }

  const { data: newFamily, error: insFam } = await supabase
    .from('families')
    .insert({ name: 'Test CRUD Family' })
    .select()
    .single();

  if (insFam) {
    record('families', 'AUTH INSERT', 'FAIL', insFam.message);
  } else {
    record('families', 'AUTH INSERT', 'PASS', `Created id: ${newFamily.id}`);

    const { error: updFam } = await supabase
      .from('families')
      .update({ name: 'Test CRUD Family UPDATED' })
      .eq('id', newFamily.id);

    if (updFam) {
      record('families', 'AUTH UPDATE', 'FAIL', updFam.message);
    } else {
      record('families', 'AUTH UPDATE', 'PASS', 'Updated name successfully');
    }

    // ---- BILL_RULES (CRUD - depends on family) ----
    console.log('\n--- BILL_RULES ---');

    const { data: rules, error: selRule } = await supabase.from('bill_rules').select('*');
    if (selRule) {
      record('bill_rules', 'AUTH SELECT', 'FAIL', selRule.message);
    } else {
      record('bill_rules', 'AUTH SELECT', 'PASS', `Returned ${rules.length} rows`);
    }

    const { data: newRule, error: insRule } = await supabase
      .from('bill_rules')
      .insert({
        family_id: newFamily.id,
        name: 'Test CRUD Rule',
        amount: 100.00,
        first_due_date: '2026-05-01',
      })
      .select()
      .single();

    if (insRule) {
      record('bill_rules', 'AUTH INSERT', 'FAIL', insRule.message);
    } else {
      record('bill_rules', 'AUTH INSERT', 'PASS', `Created id: ${newRule.id}`);

      const { error: updRule } = await supabase
        .from('bill_rules')
        .update({ name: 'Test CRUD Rule UPDATED', amount: 200.00 })
        .eq('id', newRule.id);

      if (updRule) {
        record('bill_rules', 'AUTH UPDATE', 'FAIL', updRule.message);
      } else {
        record('bill_rules', 'AUTH UPDATE', 'PASS', 'Updated name and amount');
      }

      // ---- BILL_OCCURRENCES (CRUD - depends on family + rule) ----
      console.log('\n--- BILL_OCCURRENCES ---');

      const { data: occs, error: selOcc } = await supabase.from('bill_occurrences').select('*').limit(5);
      if (selOcc) {
        record('bill_occurrences', 'AUTH SELECT', 'FAIL', selOcc.message);
      } else {
        record('bill_occurrences', 'AUTH SELECT', 'PASS', `Returned ${occs.length} rows (limit 5)`);
      }

      const { data: newOcc, error: insOcc } = await supabase
        .from('bill_occurrences')
        .insert({
          family_id: newFamily.id,
          rule_id: newRule.id,
          name: 'Test CRUD Occurrence',
          amount: 100.00,
          due_date: '2026-05-01',
        })
        .select()
        .single();

      if (insOcc) {
        record('bill_occurrences', 'AUTH INSERT', 'FAIL', insOcc.message);
      } else {
        record('bill_occurrences', 'AUTH INSERT', 'PASS', `Created id: ${newOcc.id}`);

        const { error: updOcc } = await supabase
          .from('bill_occurrences')
          .update({ paid: true, payment_date: '2026-05-01' })
          .eq('id', newOcc.id);

        if (updOcc) {
          record('bill_occurrences', 'AUTH UPDATE', 'FAIL', updOcc.message);
        } else {
          record('bill_occurrences', 'AUTH UPDATE', 'PASS', 'Marked as paid');
        }

        const { error: delOcc } = await supabase
          .from('bill_occurrences')
          .delete()
          .eq('id', newOcc.id);

        if (delOcc) {
          record('bill_occurrences', 'AUTH DELETE', 'FAIL', delOcc.message);
        } else {
          record('bill_occurrences', 'AUTH DELETE', 'PASS', 'Deleted test record');
        }
      }

      // Cleanup rule
      const { error: delRule } = await supabase
        .from('bill_rules')
        .delete()
        .eq('id', newRule.id);

      if (delRule) {
        record('bill_rules', 'AUTH DELETE', 'FAIL', delRule.message);
      } else {
        record('bill_rules', 'AUTH DELETE', 'PASS', 'Deleted test record');
      }
    }

    // Cleanup family
    const { error: delFam } = await supabase
      .from('families')
      .delete()
      .eq('id', newFamily.id);

    if (delFam) {
      record('families', 'AUTH DELETE', 'FAIL', delFam.message);
    } else {
      record('families', 'AUTH DELETE', 'PASS', 'Deleted test record');
    }
  }

  // ---- USER_ROLES (read-only) ----
  console.log('\n--- USER_ROLES ---');

  const { data: roles, error: selRoles } = await supabase.from('user_roles').select('*');
  if (selRoles) {
    record('user_roles', 'AUTH SELECT', 'FAIL', selRoles.message);
  } else {
    record('user_roles', 'AUTH SELECT', 'PASS', `Returned ${roles.length} rows`);
  }

  // INSERT should fail (no insert policy)
  const { error: insRole } = await supabase
    .from('user_roles')
    .insert({ user_id: authData.user.id, role: 'assistant' });

  if (insRole) {
    record('user_roles', 'AUTH INSERT (expect fail)', 'PASS', `Correctly blocked: ${insRole.message}`);
  } else {
    record('user_roles', 'AUTH INSERT (expect fail)', 'WARN', 'INSERT succeeded - should be admin-only?');
    // Clean up
    await supabase.from('user_roles').delete().eq('user_id', authData.user.id).neq('id', roles?.[0]?.id);
  }

  await supabase.auth.signOut();
}

// ============================================================
// 3. PRINT SUMMARY
// ============================================================
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n  ✅ PASS: ${totalPass}`);
  console.log(`  ❌ FAIL: ${totalFail}`);
  console.log(`  ⚠️  WARN: ${totalWarn}`);
  console.log(`  📋 TOTAL: ${results.length}`);

  if (totalFail > 0) {
    console.log('\n🔴 FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   ❌ [${r.table}] ${r.operation}: ${r.detail}`);
    });
  }

  if (totalWarn > 0) {
    console.log('\n🟡 WARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   ⚠️  [${r.table}] ${r.operation}: ${r.detail}`);
    });
  }

  console.log('\n' + (totalFail === 0 ? '🎉 All critical tests passed!' : '🚨 Some tests FAILED - review above!'));
}

// Run
try {
  await testUnauthenticated();
  await testAuthenticatedCrud();
  printSummary();
} catch (err) {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
}
