import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import { format } from 'date-fns';

// Configuration du client Sanity (similaire à src/lib/sanityClient.ts mais pour Node.js)
const sanityClientConfig = {
  projectId: 'n5uztn17', // Votre Project ID Sanity
  dataset: 'production',   // Votre Dataset Sanity
  useCdn: false,          // Toujours les données fraîches pour le sitemap
  apiVersion: '2024-03-11', // Date de la dernière modification majeure de l'API
};
const client = createClient(sanityClientConfig);

// URL de base de votre site (IMPORTANT: à remplacer par votre vrai domaine en production)
const BASE_URL = process.env.VITE_SITE_URL || 'https://www.smoothiebananefraise.fr'; 
// Si VITE_SITE_URL n'est pas défini, il utilisera le placeholder.
// Assurez-vous que VITE_SITE_URL est défini dans votre environnement de build (ex: Vercel, Netlify)

async function generateSitemap() {
  console.log('Génération du sitemap...');

  const today = format(new Date(), 'yyyy-MM-dd');

  // Pages statiques
  const staticPages = [
    { url: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
    { url: '/coach-virtuel', changefreq: 'monthly', priority: '0.8', lastmod: today },
    { url: '/blog', changefreq: 'daily', priority: '0.9', lastmod: today },
    // Ajoutez d'autres pages statiques ici si nécessaire
  ];

  // Récupérer les articles de blog depuis Sanity
  const postsQuery = `*[_type == "post" && defined(slug.current) && defined(category->slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    "categorySlug": category->slug.current,
    "lastmod": coalesce(publishedAt, _updatedAt, _createdAt) 
  }`;
  const posts = await client.fetch(postsQuery);

  const sitemapEntries = staticPages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

  const dynamicEntries = posts.map(post => {
    const postUrl = `/${post.categorySlug}/${post.slug}`;
    const lastModified = post.lastmod ? format(new Date(post.lastmod), 'yyyy-MM-dd') : today;
    return `
  <url>
    <loc>${BASE_URL}${postUrl}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('');

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
${dynamicEntries}
</urlset>`;

  const sitemapPath = path.resolve('public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent);

  console.log(`Sitemap généré avec succès : ${sitemapPath}`);
}

generateSitemap().catch(error => {
  console.error('Erreur lors de la génération du sitemap:', error);
  process.exit(1);
});