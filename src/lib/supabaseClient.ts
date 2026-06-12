import { createClient } from '@supabase/supabase-js';

const env: any = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

let _supabase: any = null;

if (!supabaseUrl || !supabaseAnonKey) {
  // Avoid throwing at import-time to prevent blank screen; provide a stub.
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Supabase client will be a stub.');
  // Simple chainable query stub: select()/eq()/maybeSingle() etc. return the same
  const queryResult = { data: null, error: { message: 'Supabase not configured' } };
  const queryBuilder: any = {
    select: (..._args: any[]) => queryBuilder,
    eq: (..._args: any[]) => queryBuilder,
    in: (..._args: any[]) => queryBuilder,
    update: async (..._args: any[]) => queryResult,
    insert: async (..._args: any[]) => queryResult,
    delete: async (..._args: any[]) => queryResult,
    maybeSingle: async () => queryResult,
    single: async () => queryResult,
    upsert: async (..._args: any[]) => queryResult,
    order: (..._args: any[]) => queryBuilder,
    limit: (..._args: any[]) => queryBuilder,
    range: (..._args: any[]) => queryBuilder,
    // for .select('a, b') chains
    then: (_res: any) => Promise.resolve(queryResult),
  };

  _supabase = {
    from: (_table: string) => queryBuilder,
    storage: {
      from: () => ({
        upload: async () => ({ error: { message: 'Supabase storage not configured' } }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' }, error: null }),
      }),
    },
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
    },
    functions: {
      invoke: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    },
    storageFrom: (_: string) => ({ getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }) }),
  };
} else {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = _supabase;
