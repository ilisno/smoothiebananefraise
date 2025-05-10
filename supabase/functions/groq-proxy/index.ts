import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
            import { corsHeaders } from "../_shared/cors.ts"; // Assurez-vous que ce fichier existe ou définissez les headers ici

            // Récupérer la clé API Groq depuis les secrets de la fonction
            const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY_SECRET");
            const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

            serve(async (req: Request) => {
              // Gérer les requêtes OPTIONS pour CORS
              if (req.method === "OPTIONS") {
                return new Response(null, { headers: corsHeaders });
              }

              if (!GROQ_API_KEY) {
                return new Response(
                  JSON.stringify({ error: "Clé API Groq non configurée côté serveur." }),
                  { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
              }

              try {
                const { model, messages, temperature } = await req.json();

                if (!messages || !model) {
                  return new Response(
                    JSON.stringify({ error: "Les champs 'model' et 'messages' sont requis." }),
                    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                  );
                }
                
                console.log("Proxying request to Groq API with model:", model);

                const groqResponse = await fetch(GROQ_API_URL, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ model, messages, temperature: temperature || 0.7 }),
                });

                const groqData = await groqResponse.json();

                if (!groqResponse.ok) {
                  console.error("Groq API Error (via proxy):", groqData);
                  return new Response(
                    JSON.stringify({ error: groqData.error || "Erreur de l'API Groq" }),
                    { status: groqResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                  );
                }
                
                return new Response(JSON.stringify(groqData), {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                });

              } catch (error) {
                console.error("Error in Groq proxy Edge Function:", error);
                return new Response(
                  JSON.stringify({ error: error.message || "Erreur interne du serveur." }),
                  { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
              }
            });