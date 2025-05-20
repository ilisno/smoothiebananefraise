import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from '@/components/Header'; // Import Header
import Footer from '@/components/Footer'; // Import Footer

const Login: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // If a session exists (user is logged in), redirect to Mon Espace
      if (session) {
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
            providers={[]} // No third-party providers for now
            redirectTo={window.location.origin + '/mon-espace'} // Redirect after successful auth
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Votre email',
                  password_label: 'Votre mot de passe',
                  email_input_placeholder: 'Entrez votre email',
                  password_input_placeholder: 'Entrez votre mot de passe',
                  button_label: 'Se connecter',
                  loading_button_label: 'Connexion en cours...',
                  social_provider_text: 'Se connecter avec {{provider}}',
                  link_text: 'Déjà un compte ? Connectez-vous',
                },
                sign_up: {
                  email_label: 'Votre email',
                  password_label: 'Votre mot de passe',
                  email_input_placeholder: 'Entrez votre email',
                  password_input_placeholder: 'Créez un mot de passe',
                  button_label: "S'inscrire",
                  loading_button_label: 'Inscription en cours...',
                  social_provider_text: "S'inscrire avec {{provider}}",
                  link_text: "Pas encore de compte ? Inscrivez-vous",
                  // Add first and last name fields to signup
                  email_confirm_label: 'Confirmez votre email', // Add if email confirmation is enabled
                  email_confirm_input_placeholder: 'Confirmez votre email', // Add if email confirmation is enabled
                  password_confirm_label: 'Confirmez votre mot de passe', // Add if password confirmation is enabled
                  password_confirm_input_placeholder: 'Confirmez votre mot de passe', // Add if password confirmation is enabled
                },
                forgotten_password: {
                  email_label: 'Votre email',
                  email_input_placeholder: 'Entrez votre email',
                  button_label: 'Envoyer les instructions de réinitialisation',
                  loading_button_label: 'Envoi en cours...',
                  link_text: 'Mot de passe oublié ?',
                },
                update_password: {
                  password_label: 'Nouveau mot de passe',
                  password_input_placeholder: 'Entrez votre nouveau mot de passe',
                  button_label: 'Mettre à jour le mot de passe',
                  loading_button_label: 'Mise à jour en cours...',
                },
                magic_link: {
                  email_input_placeholder: 'Entrez votre email',
                  button_label: 'Envoyer le lien magique',
                  loading_button_label: 'Envoi en cours...',
                  link_text: 'Envoyer un lien magique par email',
                },
                verify_otp: {
                  email_input_placeholder: 'Entrez votre email',
                  phone_input_placeholder: 'Entrez votre numéro de téléphone',
                  token_input_placeholder: 'Code OTP',
                  email_label: 'Email',
                  phone_label: 'Numéro de téléphone',
                  token_label: 'Code OTP',
                  button_label: 'Vérifier le code OTP',
                  loading_button_label: 'Vérification en cours...',
                },
              },
            }}
            // Add extraData to collect first/last name during signup
            // This data is passed to the handle_new_user trigger
            extraData={{
               first_name: '', // Placeholder, Auth UI needs to support custom fields
               last_name: '',  // Placeholder
            }}
          />
           {/* Note: The default Supabase Auth UI component doesn't natively support adding
               first_name and last_name fields directly in the form without customization.
               You would typically need to fork/customize the Auth UI component or
               collect this information *after* the user signs up successfully.
               For this example, the trigger is set up to *expect* this data,
               but the default UI won't provide it. A real implementation would
               require a custom signup form or post-signup profile completion step.
               The trigger will insert nulls for first_name/last_name with the current UI.
           */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;