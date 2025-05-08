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

// Exporter les données importées du JSON
export const blogPosts: BlogPost[] = blogDataJson as BlogPost[];