import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.VERCEL_GIT_COMMIT_REF || // Vercel branch env var
  process.env.HEAD || // Netlify branch env var
  "main";

// Utiliser les variables d'environnement pour clientId et token
const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null; // Utilise null si non défini
const token = process.env.TINA_TOKEN || null; // Utilise null si non défini

// Vérifier si les variables nécessaires sont présentes pour le build
const isTinaEnabled = clientId && token;

export default defineConfig({
  branch,
  clientId: clientId, // Lu depuis les variables d'environnement
  token: token,       // Lu depuis les variables d'environnement

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads/blog",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Articles de Blog",
        path: "src/lib",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: () => 'blogData',
          },
          allowedActions: {
            create: true,
            delete: true,
          },
        },
        fields: [
          {
            type: "object",
            name: "posts",
            label: "Liste des Articles",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title ?? "Nouvel Article" }),
            },
            fields: [
              { type: "string", label: "Titre", name: "title", isTitle: true, required: true },
              { type: "string", label: "Slug (URL)", name: "slug", required: true, description: "Partie de l'URL, ex: mon-super-article. Doit être unique." },
              { type: "string", label: "Catégorie", name: "category", required: true, description: "Ex: hypertrophie, nutrition, debutant. Utilisé dans l'URL." },
              { type: "datetime", label: "Date de Publication", name: "date", ui: { dateFormat: "DD/MM/YYYY", timeFormat: false } },
              { type: "string", label: "Extrait (pour la carte)", name: "excerpt", ui: { component: 'textarea' } },
              { type: "rich-text", label: "Contenu Principal", name: "content", isBody: true, description: "Le contenu principal de l'article." },
              { type: "image", label: "Image de l'article (URL ou chemin)", name: "imageUrl" },
              { type: "string", label: "Méta Description (SEO)", name: "metaDescription" },
              { type: "string", label: "Méta Mots-clés (SEO)", name: "metaKeywords", list: true },
            ],
          },
        ],
      },
    ],
  },
  // Optionnel: pour désactiver Tina en production si les variables ne sont pas définies
  // Peut être utile si vous ne voulez pas que l'admin soit accessible en production
  // tinaioConfig: {
  //   frontendUrlOverride: process.env.VERCEL_URL
  // },
  // Peut nécessiter une configuration plus avancée pour désactiver complètement si isTinaEnabled est false
});