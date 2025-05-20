import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProgrammeGenerator from "./pages/ProgrammeGenerator";
import Blog from "./pages/Blog"; // Import the Blog page
import BlogPostDetail from "./pages/BlogPostDetail"; // Import the new BlogPostDetail page
import CoachVirtuel from "./pages/CoachVirtuel"; // Import the new CoachVirtuel page placeholder
import MonEspace from "./pages/MonEspace"; // Import MonEspace
import Login from "./pages/Login"; // Import Login page
import { PopupProvider } from "./contexts/PopupContext"; // Import PopupProvider

// Import Supabase client and SessionContextProvider
import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from '@supabase/auth-ui-react';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Wrap BrowserRouter with SessionContextProvider */}
      <SessionContextProvider supabaseClient={supabase}>
        <BrowserRouter>
          <PopupProvider> {/* Wrap the Routes with PopupProvider */}
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/programme" element={<ProgrammeGenerator />} />
              <Route path="/blog" element={<Blog />} /> {/* Route for the blog list page */}
              {/* Route for individual blog posts using category and post slugs */}
              <Route path="/:categorySlug/:postSlug" element={<BlogPostDetail />} />
              <Route path="/coach-virtuel" element={<CoachVirtuel />} /> {/* Route for Coach Virtuel placeholder */}
              <Route path="/mon-espace" element={<MonEspace />} /> {/* Route for Mon Espace */}
              <Route path="/login" element={<Login />} /> {/* Route for Login */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PopupProvider>
        </BrowserRouter>
      </SessionContextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;