import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://morlgdmenrphxorhdjaf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcmxnZG1lbnJwaHhvcmhkamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTQzMjksImV4cCI6MjA4NjQzMDMyOX0.eV3daWt5Do3p4SO9pYhtrcFp3mEN6_qvlWq7RlL-6_o";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

async function testLogin() {
  console.log("Starting login test...");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "gabriela.dinis@panahgah.org",
      password: "panagah2026"
    });
    console.log("Error:", error);
    console.log("Session:", data?.session);
    console.log("User:", data?.user);
  } catch (err) {
    console.error("Exception:", err);
  }
}

testLogin();
