import { createClient } from '@supabase/supabase-js';

// Lire les variables d'environnement fournies par Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier si les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in environment variables.");
}

// Créer et exporter le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log pour vérifier en développement (sera visible dans la console du navigateur)
// console.log("Supabase client initialized with URL:", supabaseUrl ? "Loaded" : "Missing");