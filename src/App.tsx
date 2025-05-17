import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Header from "./components/Header";
import Index from "./pages/Index.tsx"; // la nouvelle page d'accueil
import ProgramGeneratorPage from "./pages/ProgramGeneratorPage.tsx"; // Import correct de la page du générateur
import NotFound from "./pages/NotFound";
import BlogIndexPage from "./pages/blog/BlogIndexPage";
import BlogPostPage from "./pages/blog/BlogPostPage";
import ChatbotPage from "./pages/ChatbotPage";
import PersonalSpacePage from "./pages/PersonalSpacePage";
import { MessageCircle } from "lucide-react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react"; // renommé pour clarté

const queryClient = new QueryClient();

// déclaration de gtag pour typescript afin d'éviter les erreurs de type
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: object) => void;
  }
}

const GoogleAnalyticsRouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      // envoie un événement page_view à google analytics lors d'un changement de route
      window.gtag('config', 'G-4HWGD7KEEK', {
        page_path: location.pathname + location.search,
      });
      // console.log(`ga: page_view sent for ${location.pathname + location.search}`); // pour débogage
    }
  }, [location]);

  return null;
};

const FloatingCoachButton = () => {
  const location = useLocation();
  const [showInitialLabel, setShowInitialLabel] = useState(true);
  const [isClientRendered, setIsClientRendered] = useState(false);

  useEffect(() => {
    setIsClientRendered(true);
    const timer = setTimeout(() => {
      setShowInitialLabel(false);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // ne pas afficher le bouton sur la page du coach virtuel
  if (location.pathname === "/coach-virtuel") {
    return null;
  }

  const displayInitialLabel = isClientRendered && showInitialLabel;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center">
      {displayInitialLabel && (
        <span
          className="mr-3 p-2 bg-card text-card-foreground border shadow-lg rounded-lg text-sm animate-pulse"
        >
          ton coach virtuel gratuit 24h/24
        </span>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/coach-virtuel"
            className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="ouvrir le coach virtuel"
          >
            <MessageCircle size={28} />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left" className="mb-1 mr-1 bg-background text-foreground border shadow-md px-3 py-1.5 rounded-md text-sm">
          <p>ton coach virtuel gratuit 24h/24</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <GoogleAnalyticsRouteChangeTracker /> {/* ajout du tracker pour ga */}
        <Routes>
          <Route path="/" element={<Index />} /> {/* nouvelle page d'accueil */}
          <Route path="/generateur-programme" element={<ProgramGeneratorPage />} /> {/* route pour le générateur */}
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/coach-virtuel" element={<ChatbotPage />} />
          <Route path="/espace-personnel" element={<PersonalSpacePage />} />
          <Route path="/:category/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingCoachButton />
        <VercelAnalytics /> {/* vercel analytics est toujours là */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;