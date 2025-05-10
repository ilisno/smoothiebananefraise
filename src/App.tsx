import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // Import du Header
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BlogIndexPage from "./pages/blog/BlogIndexPage";
import BlogPostPage from "./pages/blog/BlogPostPage";
import ChatbotPage from "./pages/ChatbotPage"; // Import de la nouvelle page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header /> {/* Ajout du Header ici */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/chatbot-musculation" element={<ChatbotPage />} /> {/* Nouvelle route */}
          {/* Route pour les articles de blog avec catégorie et slug */}
          {/* CETTE ROUTE DOIT ÊTRE ASSEZ GÉNÉRIQUE, LA PLACER AVANT NOTFOUND */}
          <Route path="/:category/:slug" element={<BlogPostPage />} /> 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;