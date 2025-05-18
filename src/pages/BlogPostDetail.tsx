import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionShadcn } from '@/components/ui/card';
import { sanityClient } from '@/integrations/sanity/client'; // Import Sanity client
import { PortableText } from '@portabletext/react'; // Import PortableText component

// Define the type for a single blog post based on the Sanity query
type BlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  category?: { title: string; slug: { current: string } };
  mainImage?: {
    asset: { url: string };
    alt?: string;
  };
  excerpt?: string;
  body?: any; // Sanity Portable Text is typically an array of blocks
  metaDescription?: string;
  metaKeywords?: string;
  author?: { name: string };
};

// Optional: Define custom components for Portable Text rendering
// This allows you to control how headings, paragraphs, images, etc., are displayed
const components = {
  // Example: Custom rendering for headings
  block: {
    h1: ({children}: any) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
    h2: ({children}: any) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
    normal: ({children}: any) => <p className="mb-4">{children}</p>,
    // Add other block types as needed (blockquote, etc.)
  },
  // Example: Custom rendering for images
  types: {
    image: ({value}: any) => {
      // You might need to use @sanity/image-url to generate image URLs with transformations
      // For simplicity, we'll just use the raw URL if available
      if (!value || !value.asset || !value.asset.url) return null;
      return (
        <img
          src={value.asset.url}
          alt={value.alt || 'Blog image'}
          className="my-6 rounded-md max-w-full h-auto mx-auto" // Basic styling
        />
      );
    },
    // Add other custom types from your schema if any
  },
  // Example: Custom rendering for lists
  list: {
    bullet: ({children}: any) => <ul className="list-disc list-inside mb-4">{children}</ul>,
    number: ({children}: any) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
  },
  // Example: Custom rendering for list items
  listItem: {
    bullet: ({children}: any) => <li className="mb-1">{children}</li>,
    number: ({children}: any) => <li className="mb-1">{children}</li>,
  },
  // Example: Custom rendering for marks (bold, italic, links, etc.)
  marks: {
    link: ({value, children}: any) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return (
        <a href={value?.href} target={target} rel={target === '_blank' ? 'noindex nofollow' : undefined} className="text-blue-600 hover:underline">
          {children}
        </a>
      );
    },
    // Add other marks as needed (strong, em, code, etc.)
  },
};


const BlogPostDetail: React.FC = () => {
  // Get slugs from the URL parameters
  const { categorySlug, postSlug } = useParams<{ categorySlug: string; postSlug: string }>();

  // State to hold the blog post
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Sanity Data Fetching for a single post ---
  useEffect(() => {
    if (!categorySlug || !postSlug) {
      setError("Slugs de catégorie ou d'article manquants dans l'URL.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        // GROQ query to fetch a single document of type 'post' by slugs
        const query = `*[_type == "post" && slug.current == $postSlug && category->slug.current == $categorySlug][0] {
          _id,
          title,
          slug,
          mainImage{
            asset->{url},
            alt
          },
          "category": category->{title, slug},
          publishedAt,
          excerpt,
          body, // Fetch the body content (Portable Text)
          metaDescription,
          metaKeywords,
          author->{name} // Fetch author name
        }`;

        console.log("Fetching single post with query:", query); // Log the query
        console.log("Query parameters:", { postSlug, categorySlug }); // Log parameters

        const data = await sanityClient.fetch<BlogPost | null>(query, { postSlug, categorySlug });

        console.log("Fetched single post data:", data); // Log the fetched data

        if (data) {
          setPost(data);
        } else {
          // If data is null, the post was not found
          setError("Article non trouvé.");
        }
      } catch (err) {
        console.error("Failed to fetch single post:", err);
        setError("Impossible de charger l'article. Veuillez vérifier la console pour plus de détails.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [categorySlug, postSlug]); // Re-run effect if slugs change

  // --- Render Loading, Error, or Post ---
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p>Chargement de l'article...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p className="text-red-500">{error}</p>
          {/* Optionally add a link back to the blog list */}
          <div className="mt-4">
             <Link to="/blog" className="text-blue-500 hover:underline">Retour au blog</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
     // This case should ideally be covered by the error state if data is null,
     // but as a fallback, we can show a specific message.
     // Or, you might redirect to a 404 page here.
     return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <p>Article non trouvé.</p>
           <div className="mt-4">
             <Link to="/blog" className="text-blue-500 hover:underline">Retour au blog</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- Render the Post ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-3xl shadow-lg">
          {post.mainImage?.asset?.url && (
            <img
              src={post.mainImage.asset.url}
              alt={post.mainImage.alt || post.title}
              className="w-full h-64 object-cover rounded-t-lg"
            />
          )}
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 mb-2">{post.title}</CardTitle>
            <CardDescriptionShadcn className="text-gray-600">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue'}
              {post.category?.title && ` • ${post.category.title}`}
              {post.author?.name && ` • par ${post.author.name}`}
            </CardDescriptionShadcn>
          </CardHeader>
          <CardContent className="prose max-w-none p-6"> {/* Using prose class for basic text styling */}
            {/* Render the Portable Text body */}
            {post.body && <PortableText value={post.body} components={components} />}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostDetail;