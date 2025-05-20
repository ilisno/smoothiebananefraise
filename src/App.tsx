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
import { PopupProvider } from "./contexts/PopupContext"; // Import PopupProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PopupProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;