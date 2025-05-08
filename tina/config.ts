import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  // Remplacez par votre Client ID GitHub OAuth App si vous voulez utiliser l'authentification GitHub
  // clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID, 
  // Remplacez par votre token si vous utilisez l'authentification par token Tina Cloud
  // token: process.env.TINA_TOKEN, 

  build: {
    outputFolder: "admin", // Dossier où l'interface d'admin Tina sera construite
    publicFolder: "public", // Dossier contenant les assets statiques
  },
  media: {
    tina: {
      mediaRoot: "uploads/blog", // Sous-dossier dans publicFolder pour les médias
      publicFolder: "public",
    },
  },
  // Schéma de votre contenu
  schema: {
    collections: [
      {
        name: "post", // Nom de la collection
        label: "Articles de Blog",
        path: "src/lib", // Chemin vers le dossier contenant le fichier
        format: "json", // Format du fichier
        ui: {
          // Indique à Tina que tous les documents de cette collection sont dans un seul fichier
          filename: {
            // Désactive la possibilité de changer le nom du fichier (on veut garder blogData.json)
            readonly: true,
            // Définit le nom du fichier unique
            slugify: () => 'blogData', 
          },
          // Permet de créer de nouveaux articles dans le fichier JSON
          allowedActions: {
            create: true,
            delete: true,
          },
        },
        // Définition de la structure des données DANS le fichier JSON
        fields: [
          {
            // Champ qui représente la liste des posts dans le fichier JSON
            type: "object",
            name: "posts", // Doit correspondre à la clé dans blogData.json
            label: "Liste des Articles",
            list: true, // Indique que c'est une liste d'objets
            ui: {
              // Améliore l'interface pour la liste
              itemProps: (item) => ({ label: item?.title ?? "Nouvel Article" }),
            },
            fields: [ // Champs pour CHAQUE article dans la liste "posts"
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
});