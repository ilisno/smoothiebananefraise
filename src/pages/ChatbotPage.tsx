import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import ChatInterface, { Message } from '@/components/Chatbot/ChatInterface';
import AffiliatePopup from '@/components/AffiliatePopup'; // Importer le composant de popup
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client'; // Importer supabase pour le logging

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Copie de popupData et logAffiliateLinkClick pour cet exemple
// Idéalement, cela pourrait être dans un fichier partagé
const popupAffiliateData = [ // Renommé pour éviter confusion si Index.tsx est ouvert
  {
    image: '/popup-placeholder-1.jpg',
    link: 'https://nmsquad.link/03olk',
    buttonText: 'Découvrir la whey de qualité',
    title: 'Nutrimuscle — Construis du muscle',
    description: '<b>Que du propre, du traçable et du performant.</b>\nLa whey Nutrimuscle, c’est du sérieux pour <b>des vrais résultats.</b>\n<b>Formulations haut de gamme, sans compromis.</b>',
  },
  // On pourrait ajouter d'autres popups ici et les choisir aléatoirement
];

const logAffiliateLinkClick = async (popupIndex: number, data: typeof popupAffiliateData[0]) => {
  if (!data) {
    console.error('Invalid popupData for logging affiliate click');
    return;
  }
  try {
    const { error } = await supabase.from('affiliate_link_clicks').insert({
      popup_image_src: data.image,
      affiliate_link: data.link,
      popup_title: data.title,
      popup_button_text: data.buttonText,
    });
    if (error) {
      console.error('Error logging affiliate link click:', error);
    } else {
      console.log('Affiliate link click logged successfully for:', data.title);
    }
  } catch (e) {
    console.error('Exception logging affiliate link click:', e);
  }
};


const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isInitialPopupOpen, setIsInitialPopupOpen] = useState(true);
  const [isPeriodicPopupOpen, setIsPeriodicPopupOpen] = useState(false);
  
  const periodicPopupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const selectedAffiliatePopup = popupAffiliateData[0]; // Pour cet exemple, on utilise toujours le premier

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role, content, id: Date.now().toString() + Math.random().toString() },
    ]);
  };

  // Gérer la fermeture du popup initial
  const handleInitialPopupClose = () => {
    setIsInitialPopupOpen(false);
    setIsChatbotVisible(true);
  };
  
  // Gérer le clic sur le lien d'affiliation du popup initial
  const handleInitialAffiliateClick = () => {
    if (selectedAffiliatePopup.link) {
      logAffiliateLinkClick(0, selectedAffiliatePopup);
      window.open(selectedAffiliatePopup.link, '_blank');
    }
    handleInitialPopupClose(); // Ferme le popup et affiche le chat
  };

  // Message d'introduction de l'IA (modifié pour être concis)
  useEffect(() => {
    if (isChatbotVisible && messages.length === 0) {
      addMessage('assistant', "Bienvenue ! Pose-moi tes questions sur la musculation. Je serai concis.");
    }
  }, [isChatbotVisible, messages]); // Dépend de isChatbotVisible

  // Timer pour le popup périodique
  useEffect(() => {
    if (isChatbotVisible && !isInitialPopupOpen) {
      periodicPopupIntervalRef.current = setInterval(() => {
        if (!isPeriodicPopupOpen && !isInitialPopupOpen) { // Assure qu'un autre popup n'est pas déjà ouvert
          console.log("Déclenchement du popup périodique d'affiliation.");
          setIsPeriodicPopupOpen(true);
        }
      }, 60000); // Toutes les 60 secondes
    } else {
      if (periodicPopupIntervalRef.current) {
        clearInterval(periodicPopupIntervalRef.current);
      }
    }
    return () => {
      if (periodicPopupIntervalRef.current) {
        clearInterval(periodicPopupIntervalRef.current);
      }
    };
  }, [isChatbotVisible, isInitialPopupOpen, isPeriodicPopupOpen]);


  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isPeriodicPopupOpen) return; // Ne pas envoyer si popup périodique ouvert

    const userMessageContent = inputValue;
    addMessage('user', userMessageContent);
    setInputValue('');
    setIsLoading(true);

    const historyForApi = messages.slice(-5); 
    const apiMessages = [
      { role: 'system', content: "Tu es un coach musculation. Donne des conseils pratiques et adaptés. Tes réponses doivent être concises et aller droit au but." }, // Prompt système modifié
      ...historyForApi.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: userMessageContent },
    ];
    
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        addMessage('assistant', data.choices[0].message.content);
      } else {
        throw new Error("Réponse invalide de l'API Groq.");
      }
    } catch (error) {
      console.error('Erreur lors de la communication avec Groq API:', error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      addMessage('assistant', `Désolé, une erreur est survenue : ${errorMessage}`);
      toast({
        title: "Erreur Chatbot",
        description: `Impossible de contacter l'IA : ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, toast, isPeriodicPopupOpen]);


  return (
    <>
      <Helmet>
        <title>Chatbot Musculation | Smoothie Banane Fraise</title>
        <meta name="description" content="Discutez avec notre coach musculation IA pour obtenir des conseils personnalisés." />
      </Helmet>
      
      {isInitialPopupOpen && selectedAffiliatePopup && (
        <AffiliatePopup
          isOpen={isInitialPopupOpen}
          onClose={handleInitialPopupClose} // Bouton "Non merci" ou croix
          onProceed={handleInitialPopupClose} // Le bouton "Voir mon programme" devient "Continuer vers le Chatbot"
          imageSrc={selectedAffiliatePopup.image}
          affiliateLink={selectedAffiliatePopup.link}
          buttonText={selectedAffiliatePopup.buttonText} // Texte du lien d'affiliation
          title={selectedAffiliatePopup.title}
          description={selectedAffiliatePopup.description}
          onAffiliateLinkClick={handleInitialAffiliateClick} // Gère le clic sur le lien d'affiliation
        />
      )}

      {isPeriodicPopupOpen && selectedAffiliatePopup && (
        <AffiliatePopup
          isOpen={isPeriodicPopupOpen}
          onClose={() => setIsPeriodicPopupOpen(false)}
          onProceed={() => setIsPeriodicPopupOpen(false)} // "Voir mon programme" ferme juste le popup
          imageSrc={selectedAffiliatePopup.image}
          affiliateLink={selectedAffiliatePopup.link}
          buttonText={selectedAffiliatePopup.buttonText}
          title={selectedAffiliatePopup.title}
          description={selectedAffiliatePopup.description}
          onAffiliateLinkClick={() => { // Clic sur le lien d'affiliation
            if (selectedAffiliatePopup.link) {
              logAffiliateLinkClick(0, selectedAffiliatePopup);
              window.open(selectedAffiliatePopup.link, '_blank');
            }
            setIsPeriodicPopupOpen(false);
          }}
        />
      )}

      <div className="container mx-auto py-4 md:py-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)'}}> 
        {isChatbotVisible && !isInitialPopupOpen && (
          <>
            <div className="flex-grow">
              <ChatInterface
                messages={messages}
                inputValue={inputValue}
                onInputChange={(e) => setInputValue(e.target.value)}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Note: La clé API Groq est utilisée côté client pour la démonstration. 
              Dans une application de production, elle devrait être sécurisée côté serveur.
            </p>
          </>
        )}
        {!isChatbotVisible && !isInitialPopupOpen && (
             <div className="flex-grow flex items-center justify-center">
                <p>Chargement du chatbot...</p> {/* Ou un spinner */}
            </div>
        )}
      </div>
    </>
  );
};

export default ChatbotPage;