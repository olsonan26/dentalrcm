import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  convexUserId: Id<"users"> | null;
  practiceId: Id<"practices"> | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);
  const [practiceId, setPracticeId] = useState<Id<"practices"> | null>(null);

  const bootstrap = useMutation(api.bootstrap.bootstrapUser);
  const bootstrapRef = useRef(bootstrap);
  bootstrapRef.current = bootstrap;

  const syncWithConvex = useCallback(async (supaUser: User) => {
    try {
      const result = await bootstrapRef.current({
        email: supaUser.email!,
        name:
          supaUser.user_metadata?.name ||
          supaUser.email!.split("@")[0],
      });
      setConvexUserId(result.userId);
      setPracticeId(result.practiceId);
    } catch (err) {
      console.error("Bootstrap sync error:", err);
    }
  }, []);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await syncWithConvex(s.user);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await syncWithConvex(s.user);
      } else {
        setConvexUserId(null);
        setPracticeId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [syncWithConvex]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      return { error: error ? new Error(error.message) : null };
    },
    []
  );

  const signOutFn = useCallback(async () => {
    await supabase.auth.signOut();
    setConvexUserId(null);
    setPracticeId(null);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error ? new Error(error.message) : null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session && !!convexUserId,
        isLoading,
        convexUserId,
        practiceId,
        signIn,
        signUp,
        signOut: signOutFn,
        updatePassword,
        resetPasswordForEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used within SupabaseAuthProvider");
  return ctx;
}
