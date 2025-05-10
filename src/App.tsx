import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Header from "./components/Header"; // Import du Header
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BlogIndexPage from "./pages/blog/BlogIndexPage";
import BlogPostPage from "./pages/blog/BlogPostPage";
import ChatbotPage from "./pages/ChatbotPage"; 
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header /> 
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/coach-virtuel" element={<ChatbotPage />} /> {/* Route mise à jour */}
          <Route path="/:category/:slug" element={<BlogPostPage />} /> 
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Bouton flottant pour le Coach Virtuel */}
        <Link
          to="/coach-virtuel"
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors z-50"
          aria-label="Ouvrir le Coach virtuel"
        >
          <MessageCircle size={28} />
        </Link>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;