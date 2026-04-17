// Global test setup — runs before every test file
import "@testing-library/jest-dom";

// Supabase uses import.meta.env; define minimal env vars for tests
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_SUPABASE_URL: "http://localhost:54321",
    VITE_SUPABASE_ANON_KEY: "test-anon-key",
  },
});
