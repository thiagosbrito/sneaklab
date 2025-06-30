import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>