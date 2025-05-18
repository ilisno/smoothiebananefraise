import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// Placeholder type for blog posts (will be replaced by Sanity data structure)
type BlogPost = {
  _id: string;
  title: string;
  slug: string; // Unique identifier for the post URL
  publishedAt: string;
  category?: string;
  mainImage?: {
    url: string;
    alt: string;
  };
  // Add other fields as needed (e.g., excerpt, author)
};

const Blog: React.FC = () => {
  // State to hold blog posts
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Sanity Data Fetching (Placeholder) ---
  // We will add the actual Sanity fetching logic here next.
  useEffect(() => {
    // Simulate fetching data
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace this with actual Sanity client fetching
        const dummyPosts: BlogPost[] = [
          {
            _id: '1',
            title: 'Tractions lestées : programme complet pour exploser son 1RM',
            slug: 'tractions-lestees-programme-1rm',
            publishedAt: '2025-05-03',
            category: 'Hypertrophie',
            mainImage: { url: 'https://via.placeholder.com/400x200', alt: 'Illustration tractions lestées' }, // Replace with actual image URL
          },
          {
            _id: '2',
            title: 'Tirer le slack au deadlift : la clé pour un soulevé de terre plus puissant',
            slug: 'slack-pull-deadlift',
            publishedAt: '2025-04-23',
            category: 'Hypertrophie',
            mainImage: { url: 'https://via.placeholder.com/400x200', alt: 'Illustration deadlift' }, // Replace with actual image URL
          },
          {
            _id: '3',
            title: 'Douleur au biceps quand je tends le bras, que faire ?',
            slug: 'douleur-biceps-bras-tendu',
            publishedAt: '2025-04-02',
            category: 'Hypertrophie',
            mainImage: { url: 'https://via.placeholder.com/400x200', alt: 'Illustration anatomie biceps' }, // Replace with actual image URL
          },
           {
            _id: '4',
            title: 'Comment choisir ses haltères pour la maison ?',
            slug: 'choisir-halteres-maison',
            publishedAt: '2025-03-15',
            category: 'Équipement',
            mainImage: { url: 'https://via.placeholder.com/400x200', alt: 'Illustration haltères' }, // Replace with actual image URL
          },
        ];
        setPosts(dummyPosts);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Impossible de charger les articles du blog.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 text-center">
        {/* Blog Header Section */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Notre Blog Musculation
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Conseils, astuces et informations pour vous aider à atteindre vos objectifs de fitness et de musculation.
        </p>

        {/* Blog Posts Grid */}
        {loading && <p>Chargement des articles...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && posts.length === 0 && <p>Aucun article trouvé pour le moment.</p>}

        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post._id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                 {post.mainImage && (
                    <img
                      src={post.mainImage.url}
                      alt={post.mainImage.alt}
                      className="w-full h-48 object-cover" // Fixed height for images
                    />
                  )}
                <CardHeader className="flex-grow p-4"> {/* Added flex-grow */}
                  <CardTitle className="text-lg font-semibold text-gray-800 text-left mb-2">{post.title}</CardTitle>
                  <p className="text-sm text-gray-500 text-left">
                    {new Date(post.publishedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {post.category && ` • ${post.category}`}
                  </p>
                </CardHeader>
                 <CardContent className="p-4 pt-0"> {/* Adjusted padding */}
                   {/* Add excerpt here if available in post data */}
                   {/* <p className="text-gray-700 text-left mb-4">{post.excerpt}</p> */}
                   <Link to={`/blog/${post.slug}`} className="text-sbf-red hover:underline font-semibold flex items-center justify-start"> {/* Adjusted link color and alignment */}
                     Lire la suite →
                   </Link>
                 </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;