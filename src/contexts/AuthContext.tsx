import React, { createContext, useContext, useEffect, useState } from "react";
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

const fetchRole = async (userId: string): Promise<Role> => {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;
    return data.role as Role;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Auth state listener ──────────────────────────────────────────────────
  // RULE: onAuthStateChange callback must be SYNCHRONOUS.
  // Never call supabase.from() or any async Supabase operation inside it.
  // Doing so creates an internal conflict in the Supabase client causing
  // AbortError on any concurrent data request (e.g. bill update).
  //
  // Supabase v2 fires INITIAL_SESSION on mount with the stored session,
  // so this single listener handles boot + login + logout + token refresh.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Clear role immediately on logout.
        // Role for logged-in users is fetched in the separate effect below.
        if (!newSession?.user) setRole(null);

        // Boot loading is done after the first event (INITIAL_SESSION).
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Role fetch ───────────────────────────────────────────────────────────
  // Runs in a separate effect so the DB query is never inside the auth
  // listener. Uses a cancellation flag to avoid setting stale state if
  // the user changes before the query resolves.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    fetchRole(user.id).then((userRole) => {
      if (!cancelled) setRole(userRole);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
