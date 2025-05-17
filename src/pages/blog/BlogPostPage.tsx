import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { sanityClient, urlFor } from '@/lib/sanityClient';
import { SanityPost } from '@/types/sanity';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { Skeleton } from '@/components/ui/skeleton'; // Pour le chargement
import BlogPromoPopup from '@/components/blog/BlogPromoPopup'; // Import du nouveau popup

const portableTextComponents: Partial<PortableTextComponents> = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <img
          src={urlFor(value).width(800).fit('max').auto('format').url()}
          alt={value.alt || ' '}
          loading="lazy"
          className="my-6 rounded-md"
        />
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a href={value.href} rel={rel} className="text-primary hover:underline">
          {children}
        </a>
      );
    },
  },
  block: {
    h1: ({ children }) => <h1 className="text-4xl font-extrabold my-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold my-5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-semibold my-4">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-semibold my-3">{children}</h4>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic my-6">{children}</blockquote>,
    normal: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside my-4 pl-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside my-4 pl-4">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="my-1">{children}</li>,
    number: ({ children }) => <li className="my-1">{children}</li>,
  },
};


const BlogPostPage: React.FC = () => {
  const { category: categorySlug, slug: postSlug } = useParams<{ category: string; slug: string }>();
  const [post, setPost] = useState<SanityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPromoPopupOpen, setIsPromoPopupOpen] = useState(false);

  const PROMO_POPUP_SESSION_KEY = 'promoPopupShownThisSession';
  const POPUP_DELAY = 7000; // 7 secondes

  useEffect(() => {
    if (!postSlug || !categorySlug) {
      setError("Paramètres d'URL manquants.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = `*[_type == "post" && slug.current == $postSlug && category->slug.current == $categorySlug][0] {
          _id,
          title,
          slug,
          mainImage,
          "category": category->{title, slug},
          publishedAt,
          excerpt,
          body,
          metaDescription,
          metaKeywords,
          author->{name}
        }`;
        const params = { postSlug, categorySlug };
        const sanityPost: SanityPost = await sanityClient.fetch(query, params);
        
        if (sanityPost) {
          setPost(sanityPost);
          // Déclencher le popup uniquement si l'article est chargé avec succès
          const popupShown = sessionStorage.getItem(PROMO_POPUP_SESSION_KEY);
          if (!popupShown) {
            const timer = setTimeout(() => {
              setIsPromoPopupOpen(true);
            }, POPUP_DELAY);
            return () => clearTimeout(timer);
          }
        } else {
          setError("Article non trouvé.");
        }
      } catch (err) {
        console.error("Failed to fetch post from Sanity:", err);
        setError("Impossible de charger l'article. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postSlug, categorySlug]);

  const handleClosePromoPopup = () => {
    setIsPromoPopupOpen(false);
    sessionStorage.setItem(PROMO_POPUP_SESSION_KEY, 'true');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 md:py-16"> {/* Changement ici: px-4 supprimé */}
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-72 w-full mb-8" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-5/6 mb-3" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <>
        <Helmet>
          <title>Article non trouvé | Smoothie Banane Fraise</title>
          <meta name="description" content="L'article de blog que vous cherchez n'a pas été trouvé." />
        </Helmet>
        <div className="container mx-auto py-12 text-center"> {/* Changement ici: px-4 supprimé */}
          <h1 className="text-3xl font-bold mb-4">Oops! Article non trouvé</h1>
          <p className="mb-6">{error || "Nous n'avons pas pu trouver l'article que vous cherchiez."}</p>
          <Button asChild>
            <Link to="/blog">Retour au Blog</Link>
          </Button>
        </div>
      </>
    );
  }

  const imageUrl = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).fit('crop').url() : undefined;
  const pageUrl = window.location.href;

  return (
    <>
      <Helmet>
        <title>{`${post.title} | Smoothie Banane Fraise`}</title>
        {post.metaDescription && <meta name="description" content={post.metaDescription} />}
        {post.metaKeywords && post.metaKeywords.length > 0 && <meta name="keywords" content={post.metaKeywords.join(', ')} />}
        
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={post.title} />
        {post.metaDescription && <meta property="og:description" content={post.metaDescription} />}
        {imageUrl && <meta property="og:image" content={imageUrl} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={post.title} />
        {post.metaDescription && <meta name="twitter:description" content={post.metaDescription} />}
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      </Helmet>
      <div className="container mx-auto py-12 md:py-16"> {/* Changement ici: px-4 supprimé */}
        <article className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto">
          {post.mainImage && (
            <img 
              src={urlFor(post.mainImage).width(800).auto('format').url()} 
              alt={post.title} 
              className="rounded-lg mb-8 w-full max-h-[500px] object-cover" 
            />
          )}
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{post.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Publié le {new Date(post.publishedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            {post.category?.title && <span className="ml-2 capitalize before:content-['•'] before:mr-2">{post.category.title.replace(/_/g, ' ')}</span>}
            {post.author?.name && <span className="ml-2 before:content-['•'] before:mr-2">par {post.author.name}</span>}
          </p>
          
          {post.body && <PortableText value={post.body} components={portableTextComponents} />}

          <div className="mt-12">
            <Button variant="outline" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Blog
              </Link>
            </Button>
          </div>
        </article>
      </div>
      <BlogPromoPopup isOpen={isPromoPopupOpen} onClose={handleClosePromoPopup} />
    </>
  );
};

export default BlogPostPage;