import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const sanityClient = createClient({
  projectId: 'n5uztn17', // Trouvé dans smoothie-banane-fraise/sanity.cli.js
  dataset: 'production', // Trouvé dans smoothie-banane-fraise/sanity.cli.js
  useCdn: process.env.NODE_ENV === 'production', // `false` si vous voulez toujours les données fraîches
  apiVersion: '2024-03-11', // Utilisez la date d'aujourd'hui ou la date de la dernière modification majeure de l'API
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}