export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string; // Pourrait être du Markdown ou du HTML simple
  metaDescription: string;
  metaKeywords: string[];
  imageUrl?: string; // Optionnel: image pour l'article
}

export const blogPosts: BlogPost[] = [
  {
    slug: "premier-article-de-blog",
    title: "Bienvenue sur Notre Blog Musculation !",
    date: "2024-07-28",
    excerpt: "Découvrez les bases pour bien commencer votre parcours de musculation avec notre générateur de programme personnalisé.",
    content: `
      <p>Ceci est le contenu complet de notre premier article. Nous parlerons ici de l'importance d'un <strong>programme de musculation personnalisé</strong> et comment notre <strong>générateur gratuit</strong> peut vous aider.</p>
      <p>Que vous soyez débutant ou avancé, un plan adapté est la clé du succès. Notre outil prend en compte vos objectifs, votre niveau et votre équipement disponible.</p>
      <h2>Pourquoi un programme personnalisé ?</h2>
      <p>Un programme générique ne tient pas compte de vos spécificités. Avec un <strong>plan d'entraînement sur mesure</strong>, vous optimisez chaque séance pour des résultats visibles.</p>
      <p>N'hésitez pas à utiliser notre <strong>générateur de programme personnalisé musculation gratuit</strong> pour démarrer !</p>
    `,
    metaDescription: "Découvrez comment bien démarrer en musculation avec un programme personnalisé gratuit. Conseils et astuces pour tous les niveaux.",
    metaKeywords: ["blog musculation", "programme personnalisé", "générateur gratuit", "débutant musculation"],
    imageUrl: "/blog/post1-image.jpg", // Assurez-vous que cette image existe dans public/blog/
  },
  {
    slug: "optimiser-votre-nutrition",
    title: "Nutrition et Musculation : Les Clés de la Réussite",
    date: "2024-07-29",
    excerpt: "La nutrition joue un rôle crucial dans l'atteinte de vos objectifs de musculation. Apprenez les bases pour optimiser vos gains.",
    content: `
      <p>L'entraînement est une partie de l'équation, mais sans une <strong>nutrition adaptée</strong>, vos progrès en musculation seront limités.</p>
      <h2>Les Macronutriments Essentiels</h2>
      <ul>
        <li><strong>Protéines :</strong> Pour la construction et la réparation musculaire. Visez environ 1.6-2.2g par kg de poids de corps.</li>
        <li><strong>Glucides :</strong> Votre source d'énergie principale pour les entraînements intenses.</li>
        <li><strong>Lipides :</strong> Importants pour les fonctions hormonales et la santé globale.</li>
      </ul>
      <p>Pensez à adapter votre apport calorique en fonction de votre objectif : prise de masse, sèche ou maintien. Un <strong>programme de musculation personnalisé</strong> doit toujours s'accompagner d'un plan nutritionnel cohérent.</p>
    `,
    metaDescription: "Conseils essentiels sur la nutrition pour la musculation. Optimisez votre alimentation pour de meilleurs résultats et gains musculaires.",
    metaKeywords: ["nutrition musculation", "alimentation sportive", "protéines", "prise de masse", "sèche"],
    imageUrl: "/blog/post2-image.jpg", // Assurez-vous que cette image existe dans public/blog/
  },
];