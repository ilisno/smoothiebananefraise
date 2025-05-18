// src/integrations/sanity/client.ts
    import { createClient } from '@sanity/client';

    // Make sure to replace these with your actual Sanity project details
    // You should ideally use environment variables for these
    const projectId = import.meta.env.VITE_SANITY_PROJECT_ID; // Replace with your project ID or env var
    const dataset = import.meta.env.VITE_SANITY_DATASET;     // Replace with your dataset name (e.g., 'production')
    const apiVersion = '2023-09-11'; // Use a recent date

    if (!projectId || !dataset) {
      console.error("Sanity Project ID or Dataset is not defined. Check your environment variables.");
    }

    export const sanityClient = createClient({
      projectId,
      dataset,
      apiVersion, // use a UTC date string
      useCdn: true, // use the CDN for faster responses
    });