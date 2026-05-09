"use client"
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient as createBrowserSupabase } from "@/utils/supabase/client";

type User = any | null;
type Profile = {
  id?: string;
  user_id?: string;
  full_name?: string;
  email?: string;
  user_role?: string;
};

type AuthContextValue = {
  user: User;
  profile: Profile | null;
  role: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  supabase: ReturnType<typeof createBrowserSupabase> | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createBrowserSupabase());
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile(userId: string | undefined) {
      if (!userId) {
        setProfile(null);
        setRole(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, email, user_role')
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (error) {
          setProfile(null);
          setRole(null);
        } else {
          setProfile(data as Profile);
          setRole((data as Profile)?.user_role ?? null);
        }
      } catch {
        setProfile(null);
        setRole(null);
      }
    }

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setUser(session?.user ?? null);
      await fetchProfile(session?.user?.id);
      setLoading(false);

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        // fetch profile for new user or clear on sign out
        fetchProfile(session?.user?.id);
      });

      return () => {
        mounted = false;
        data.subscription.unsubscribe();
      };
    }

    const unsub = init();
    return () => {
      // ensure cleanup if init returned a cleanup
      if (typeof (unsub as any) === "function") (unsub as any)();
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role,
      isSuperAdmin: role === 'SUPER_ADMIN',
      isAdmin: role === 'ADMIN',
      isManager: role === 'MANAGER',
      loading,
      signOut,
      supabase,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
