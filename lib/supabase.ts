
import { createClient } from '@supabase/supabase-js';

// URL do seu projeto no Supabase (Equipe 3):
const supabaseUrl = 'https://efgxmdjuwykapxokwkdm.supabase.co'; 

/**
 * ATENÇÃO EDIVALDO:
 * Substitua o texto abaixo pela sua chave 'anon public'.
 * Ela está no Supabase em: Settings (Engrenagem) -> API -> anon public
 */
const supabaseAnonKey = 'COLE_SUA_CHAVE_ANON_AQUI'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
