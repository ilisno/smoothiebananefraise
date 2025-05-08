import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPosts, BlogPost } from '@/lib/blogData';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BlogPostPage: React.FC = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>(); // Récupérer category et slug
  const post = blogPosts.find((p) => p.category === category && p.slug === slug); // Trouver par category et slug

  if (!post) {
    return (
      <>
        <Helmet>
          <title>Article non trouvé | Smoothie Banane Fraise</title>
          <meta name="description" content="L'article de blog que vous cherchez n'a pas été trouvé." />
        </Helmet>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Oops! Article non trouvé</h1>
          <p className="mb-6">Nous n'avons pas pu trouver l'article que vous cherchiez.</p>
          <Button asChild>
            <Link to="/blog">Retour au Blog</Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${post.title} | Smoothie Banane Fraise`}</title>
        <meta name="description" content={post.metaDescription} />
        <meta name="keywords" content={post.metaKeywords.join(', ')} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        {post.imageUrl && <meta property="og:image" content={`${window.location.origin}${post.imageUrl}`} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto">
          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} className="rounded-lg mb-8 w-full max-h-96 object-cover" />
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{post.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Publié le {new Date(post.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            {post.category && <span className="ml-2 capitalize before:content-['•'] before:mr-2">{post.category.replace(/_/g, ' ')}</span>}
          </p>
          
          <div dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="mt-12">
            <Button variant="outline" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Blog
              </Link>
            </Button>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPostPage;