import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type Role = "admin" | "user" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: Role;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching role:", error);
        setRole(null);
      } else if (data) {
        setRole(data.role as Role);
      }
    } catch (err) {
      console.error("Unexpected error fetching role:", err);
      setRole(null);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        // Network failure or token unrefreshable: clear stale storage and force login
        if (error) {
          console.warn("Session error (possibly stale token or offline):", error.message);
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setRole(null);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchRole(session.user.id);
        }
      } catch (err) {
        // Fetch/network failure: clear stale session to avoid infinite retry loop
        console.warn("Network error during session init, clearing stale session:", err);
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore signOut errors when offline — storage will be cleared locally
        }
        setSession(null);
        setUser(null);
        setRole(null);
      } finally {
        initialLoadDone.current = true;
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (after the initial load)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip if the initial load hasn't completed — getInitialSession handles it
      if (!initialLoadDone.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, role, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
