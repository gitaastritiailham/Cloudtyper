import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('Supabase belum dikonfigurasi. Isi .env.local (lihat .env.example).')
}

// anon key aman di frontend selama RLS aktif. Jangan pakai service_role di sini.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'anon')
