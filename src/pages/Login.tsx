import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { fr } from '@supabase/auth-ui-shared/locales/fr'; // Import 'fr' from the correct subpath
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If a session exists (user is logged in), redirect to the home page
      if (session) {
        navigate('/');
      }
    });

    // Cleanup the subscription on component unmount
    return () => subscription.unsubscribe();
  }, [navigate]); // Depend on navigate to avoid lint warnings

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Connexion / Inscription</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers for simplicity
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--sbf-red))', // Use your custom red color
                    brandAccent: 'hsl(var(--sbf-yellow))', // Use your custom yellow color
                  },
                },
              },
            }}
            theme="light" // Use light theme
            redirectTo={window.location.origin + '/'} // Redirect to home after login
            localization={{ // Add localization prop
              variables: fr.variables, // Use French variables
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;