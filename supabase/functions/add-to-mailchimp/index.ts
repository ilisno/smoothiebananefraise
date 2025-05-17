import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MAILCHIMP_API_KEY = Deno.env.get('MAILCHIMP_API_KEY')
const MAILCHIMP_AUDIENCE_ID = Deno.env.get('MAILCHIMP_AUDIENCE_ID')
// Extract the datacenter part from the API key (e.g., 'us1', 'us20')
const MAILCHIMP_API_SERVER = MAILCHIMP_API_KEY ? MAILCHIMP_API_KEY.split('-')[1] : null

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust in production if needed)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Check if required secrets are set
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_API_SERVER) {
    console.error('Mailchimp API Key, Audience ID, or Server Prefix is missing in environment variables.')
    return new Response(JSON.stringify({ error: 'Configuration error: Mailchimp secrets not set.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // 1. Parse incoming request body
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required in the request body.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    console.log(`Received request to add email: ${email}`)

    // 2. Construct Mailchimp API URL
    const mailchimpUrl = `https://${MAILCHIMP_API_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/`

    // 3. Prepare Mailchimp request data
    const subscriberData = {
      email_address: email,
      status: 'subscribed', // Or 'pending' if you use double opt-in
      // You can add merge fields here if needed, e.g., merge_fields: { FNAME: 'John', LNAME: 'Doe' }
    }

    // 4. Make the request to Mailchimp API
    console.log(`Sending request to Mailchimp URL: ${mailchimpUrl}`)
    const mailchimpResponse = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData),
    })

    // 5. Handle Mailchimp response
    const responseData = await mailchimpResponse.json()
    console.log('Mailchimp Response Status:', mailchimpResponse.status)
    console.log('Mailchimp Response Body:', responseData)


    if (!mailchimpResponse.ok) {
        // Handle specific Mailchimp errors (like already subscribed)
        if (responseData.title === 'Member Exists') {
            console.log(`Email ${email} already subscribed.`);
             // You might want to update the member instead, or just return success
             // For simplicity, we'll return success here as the goal is achieved (they are on the list)
             return new Response(JSON.stringify({ message: 'Email is already subscribed.' }), {
                status: 200, // Or 201 if you prefer for 'created or already exists'
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
        // Log other errors
        console.error('Mailchimp API Error:', responseData)
        throw new Error(`Mailchimp API Error: ${responseData.detail || mailchimpResponse.statusText}`)
    }

    console.log(`Successfully added ${email} to Mailchimp audience ${MAILCHIMP_AUDIENCE_ID}.`)
    return new Response(JSON.stringify({ message: 'Successfully subscribed!' }), {
      status: 201, // Created
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: error.message || 'An internal error occurred.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})