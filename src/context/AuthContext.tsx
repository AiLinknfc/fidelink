import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

export type UserRole = 'client' | 'business' | 'admin';
export type UserModule = 'fidelizacion' | 'biografias' | 'ventas' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, module?: UserModule) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  userModule: UserModule;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);
  const [userModule, setUserModule] = useState<UserModule>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      updateDerivedState(session?.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      updateDerivedState(session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function updateDerivedState(u: User | null | undefined) {
    const role = u?.user_metadata?.role as string | undefined;
    setIsAdmin(role === 'admin');
    setUserModule((u?.user_metadata?.module as UserModule) ?? null);
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      const meta = data.user.user_metadata ?? {};
      await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          email: data.user.email ?? email,
          name: meta.name ?? email,
          role: meta.role ?? 'client',
          module: meta.module ?? null,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, module?: UserModule): Promise<{ needsConfirmation: boolean }> => {
    const meta: Record<string, string> = { name, role };
    if (module) meta.module = module;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });

    if (error) throw error;

    if (data.user && data.session) {
      await supabase.from('profiles').upsert(
        { id: data.user.id, email, name, role, module },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    }

    return { needsConfirmation: !data.session };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, isAdmin, userModule }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
