// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Pour le développement. En production, remplacez par votre domaine spécifique : 'https://smoothiebananefraise.fr'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Assurez-vous d'inclure OPTIONS
};