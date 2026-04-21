import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://morlgdmenrphxorhdjaf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcmxnZG1lbnJwaHhvcmhkamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTQzMjksImV4cCI6MjA4NjQzMDMyOX0.eV3daWt5Do3p4SO9pYhtrcFp3mEN6_qvlWq7RlL-6_o";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "gabriela.dinis@panahgah.org",
    password: "panagah2026"
  });
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Success:", !!data.user);
  }
}

testLogin();
