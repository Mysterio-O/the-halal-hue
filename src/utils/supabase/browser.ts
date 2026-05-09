import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getBrowserSupabase() {
  if (_client) return _client;

  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        // IMPORTANT: Welcome page consumes tokens manually
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        // Bypass Web Locks API to prevent "LockManager timed out" errors
        // that occur when multiple tabs or concurrent auth calls compete
        // for the same navigator.locks key. Token refresh is still safe
        // because we use a single client singleton across the app.
        lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>) => fn(),
      },
    }
  );

  return _client;
}