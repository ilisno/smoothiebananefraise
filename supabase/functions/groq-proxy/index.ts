import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY_SECRET"); // Le nom du secret que vous créerez dans Supabase
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

serve(async (req: Request) => {
  // Gérer les requêtes OPTIONS pour CORS (preflight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY_SECRET is not set in Edge Function environment variables.");
    return new Response(
      JSON.stringify({ error: "Configuration error: Groq API Key secret not set on server." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const requestBody = await req.json();
    const { model, messages, temperature } = requestBody;

    if (!messages || !model) {
      return new Response(
        JSON.stringify({ error: "Fields 'model' and 'messages' are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[groq-proxy] Proxying request to Groq API with model: ${model}`);

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
      console.error("[groq-proxy] Groq API Error:", groqData);
      return new Response(
        JSON.stringify({ error: groqData.error || "Error from Groq API" }),
        { status: groqResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify(groqData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[groq-proxy] Error in Edge Function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});