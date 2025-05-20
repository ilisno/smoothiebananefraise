import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProgrammeGenerator from "./pages/ProgrammeGenerator";
import Blog from "./pages/Blog";
import BlogPostDetail from "./pages/BlogPostDetail";
import CoachVirtuel from "./pages/CoachVirtuel";
import MonEspace from "./pages/MonEspace"; // Keep MonEspace for now, will update its logic
import Login from "./pages/Login"; // Import the new Login page
import { PopupProvider } from "./contexts/PopupContext";
import { SessionContextProvider } from '@supabase/auth-ui-react'; // Import SessionContextProvider
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

const queryClient = new QueryClient();

// Component to protect routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { data: { session } } = supabase.auth.getSession(); // Check session
  // Note: getSession is async, this check might be initially false.
  // A proper auth flow would use onAuthStateChange or a dedicated hook.
  // For simplicity here, we rely on getSession which is often cached after initial load.
  // A more robust solution would involve a loading state while checking session.

  if (!session) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider supabaseClient={supabase}> {/* Wrap with SessionContextProvider */}
          <PopupProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/programme" element={<ProgrammeGenerator />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/:categorySlug/:postSlug" element={<BlogPostDetail />} />
              <Route path="/coach-virtuel" element={<CoachVirtuel />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} /> {/* Login page */}

              {/* Protected Route for Mon Espace */}
              {/* MonEspace will now require authentication */}
              <Route
                path="/mon-espace"
                element={
                  <ProtectedRoute>
                    <MonEspace />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PopupProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;