import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SanityPost } from '@/types/sanity'; // Utilisation du nouveau type
import { urlFor } from '@/lib/sanityClient'; // Pour construire l'URL de l'image

interface PostCardProps {
  post: SanityPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  // S'assurer que category et category.slug existent avant de construire l'URL
  const categorySlug = post.category?.slug?.current;
  const postSlug = post.slug?.current;

  if (!categorySlug || !postSlug) {
    // Gérer le cas où les slugs ne sont pas disponibles, peut-être logger une erreur ou retourner null
    console.error("PostCard: Missing category or post slug for post:", post.title);
    return null; 
  }

  const postUrl = `/${categorySlug}/${postSlug}`;
  const imageUrl = post.mainImage ? urlFor(post.mainImage).width(400).height(300).url() : undefined;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        {imageUrl && (
          <img src={imageUrl} alt={post.title} className="rounded-t-lg mb-4 w-full h-48 object-cover" />
        )}
        <CardTitle className="text-xl hover:text-primary transition-colors">
          <Link to={postUrl}>{post.title}</Link>
        </CardTitle>
        <CardDescription>
          {new Date(post.publishedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          {post.category?.title && <span className="ml-2 capitalize before:content-['•'] before:mr-2">{post.category.title.replace(/_/g, ' ')}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {post.excerpt && <p className="text-sm text-muted-foreground">{post.excerpt}</p>}
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="p-0">
          <Link to={postUrl}>Lire la suite →</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;