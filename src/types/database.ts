import type { Database } from '@/integrations/supabase/types';

export type DbRow<Name extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Name]['Row'];

export type DbViewRow<Name extends keyof Database['public']['Views']> =
  Database['public']['Views'][Name]['Row'];
