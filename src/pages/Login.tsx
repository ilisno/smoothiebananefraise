import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function Login() {
  const navigate = useNavigate();

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If the user is logged in, redirect them to the Mon Espace page
      if (session) {
        console.log("User logged in, redirecting to /mon-espace");
        navigate('/mon-espace');
      }
    });

    // Cleanup the subscription on component unmount
    return () => subscription.unsubscribe();
  }, [navigate]); // Depend on navigate

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex justify-center items-center">
        <div className="w-full max-w-md">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]} // Disable third-party providers
            redirectTo={window.location.origin + '/mon-espace'} // Redirect after successful login/signup
            // Configure fields for signup to collect first and last name
            localization={{
              variables: {
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Mot de passe',
                  email_input_placeholder: 'Votre email',
                  password_input_placeholder: 'Votre mot de passe',
                  button_label: 'Créer un compte',
                  loading_button_label: 'Création en cours...',
                  social_provider_text: 'Se connecter avec {{provider}}',
                  link_text: 'Pas encore de compte ? Créer un compte',
                  additional_data_label: 'Informations supplémentaires',
                  additional_data_fields: [
                    {
                      name: 'first_name',
                      label: 'Prénom',
                      required: true,
                      type: 'text',
                    },
                    {
                      name: 'last_name',
                      label: 'Nom',
                      required: true,
                      type: 'text',
                    },
                  ],
                },
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Mot de passe',
                  email_input_placeholder: 'Votre email',
                  password_input_placeholder: 'Votre mot de passe',
                  button_label: 'Se connecter',
                  loading_button_label: 'Connexion en cours...',
                  social_provider_text: 'Se connecter avec {{provider}}',
                  link_text: 'Déjà un compte ? Se connecter',
                },
                forgotten_password: {
                  link_text: 'Mot de passe oublié ?',
                  email_label: 'Email',
                  email_input_placeholder: 'Votre email',
                  button_label: 'Réinitialiser le mot de passe',
                  loading_button_label: 'Envoi en cours...',
                },
                update_password: {
                  password_label: 'Nouveau mot de passe',
                  password_input_placeholder: 'Votre nouveau mot de passe',
                  button_label: 'Mettre à jour le mot de passe',
                  loading_button_label: 'Mise à jour en cours...',
                },
                verify_otp: {
                  email_input_label: 'Email',
                  email_input_placeholder: 'Votre email',
                  phone_input_label: 'Numéro de téléphone',
                  phone_input_placeholder: 'Votre numéro de téléphone',
                  token_input_label: 'Code OTP',
                  token_input_placeholder: 'Votre code OTP',
                  button_label: 'Vérifier',
                  loading_button_label: 'Vérification en cours...',
                },
              },
            }}
            // Pass additional data during signup
            // The Auth component handles passing the collected fields (first_name, last_name)
            // in the `data` option to the Supabase signup method.
            // The `handle_new_user` trigger in Supabase will then use this data.
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;