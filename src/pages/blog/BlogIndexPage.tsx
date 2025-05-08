import React from 'react';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from '@/lib/blogData';
import PostCard from '@/components/blog/PostCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BlogIndexPage: React.FC = () => {
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

        {blogPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
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