import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/lib/blogData';

interface PostCardProps {
  post: BlogPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const postUrl = `/${post.category}/${post.slug}`; // Nouvelle structure d'URL

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="rounded-t-lg mb-4 w-full h-48 object-cover" />
        )}
        <CardTitle className="text-xl hover:text-primary transition-colors">
          <Link to={postUrl}>{post.title}</Link>
        </CardTitle>
        <CardDescription>
          {new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          {post.category && <span className="ml-2 capitalize before:content-['•'] before:mr-2">{post.category.replace(/_/g, ' ')}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
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