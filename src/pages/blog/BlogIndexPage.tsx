import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PostCard from '@/components/blog/PostCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { sanityClient } from '@/lib/sanityClient';
import { SanityPost } from '@/types/sanity';
import { Skeleton } from '@/components/ui/skeleton'; // Pour le chargement

const BlogIndexPage: React.FC = () => {
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupérer les posts, et pour chaque post, récupérer le titre et le slug de sa catégorie
        const query = `*[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          mainImage,
          publishedAt,
          excerpt,
          metaDescription,
          metaKeywords,
          category->{ // Expansion de la référence de catégorie
            title,
            slug
          }
        }`;
        const sanityPosts: SanityPost[] = await sanityClient.fetch(query);
        setPosts(sanityPosts);
      } catch (err) {
        console.error("Failed to fetch posts from Sanity:", err);
        setError("Impossible de charger les articles. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog Musculation - Conseils et Programmes | Smoothie Banane Fraise</title>
        <meta name="description" content="Retrouvez tous nos articles de blog sur la musculation, la nutrition, et des conseils pour optimiser votre entraînement avec notre générateur de programme personnalisé." />
        <meta name="keywords" content="blog musculation, articles musculation, conseils fitness, nutrition sportive, programme entraînement" />
      </Helmet>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="text-center mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Notre Blog Musculation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Conseils, astuces et informations pour vous aider à atteindre vos objectifs de fitness et de musculation.
          </p>
        </header>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex flex-col h-full">
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {error && <p className="text-center text-destructive">{error}</p>}

        {!loading && !error && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-muted-foreground">Aucun article de blog pour le moment.</p>
        )}
        
        <div className="text-center mt-12">
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default BlogIndexPage;