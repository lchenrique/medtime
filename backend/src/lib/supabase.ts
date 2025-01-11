import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// Cliente com service role key para operações administrativas
export const supabaseAdmin = createClient(
  env.SUPABASE_URL, 
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Cliente com anon key para verificações de token
export const supabase = createClient(
  env.SUPABASE_URL, 
  env.SUPABASE_ANON_KEY
)

// Função auxiliar para verificar token JWT do Supabase
export async function verifyToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error) {
    throw new Error('Token inválido')
  }

  return user
} 