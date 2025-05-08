import blogDataJson from './blogData.json';

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  metaKeywords: string[];
  imageUrl?: string;
}

// Accéder au tableau d'articles via la clé "posts"
export const blogPosts: BlogPost[] = blogDataJson.posts as BlogPost[];