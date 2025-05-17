import { PortableTextBlock } from '@portabletext/types';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface SanitySlug {
  _type: 'slug';
  current: string;
}

export interface SanityCategoryReference {
  _type: 'reference';
  _ref: string;
}

export interface SanityCategory {
  _id: string;
  _type: 'category';
  title: string;
  slug: SanitySlug;
  description?: string;
}

export interface SanityAuthor {
  _id: string;
  _type: 'author';
  name: string;
  // Ajoutez d'autres champs d'auteur si nécessaire
}

export interface SanityPost {
  _id: string;
  _type: 'post';
  title: string;
  slug: SanitySlug;
  author?: SanityAuthor; // Référence résolue
  mainImage?: SanityImageSource;
  category: SanityCategory; // Référence résolue
  publishedAt: string; // Date ISO string
  excerpt?: string;
  body: PortableTextBlock[]; // Pour Portable Text
  metaDescription?: string;
  metaKeywords?: string[];
}