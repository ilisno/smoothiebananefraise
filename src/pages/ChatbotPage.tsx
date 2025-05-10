import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import ChatInterface, { Message } from '@/components/Chatbot/ChatInterface';
import AffiliatePopup from '@/components/AffiliatePopup'; 
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client'; 
import { Link } from 'react-router-dom'; // Importer Link pour le pont vers le générateur
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Pour le pont
import { Info } from 'lucide-react'; // Pour l'icône de l'alerte

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const popupAffiliateData = [ 
  {
    image: '/popup-placeholder-1.jpg',
    link: 'https://nmsquad.link/03olk',
    buttonText: 'Découvrir la whey de qualité',
    title: 'Nutrimuscle — Construis du muscle',
    description: '<b>Que du propre, du traçable et du performant.</b>\nLa whey Nutrimuscle, c’est du sérieux pour <b>des vrais résultats.</b>\n<b>Formulations haut de gamme, sans compromis.</b>',
  },
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
  const selectedAffiliatePopup = popupAffiliateData[0]; 

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role, content, id: Date.now().toString() + Math.random().toString() },
    ]);
  };

  const handleInitialPopupClose = () => {
    setIsInitialPopupOpen(false);
    setIsChatbotVisible(true);
  };
  
  const handleInitialAffiliateClick = () => {
    if (selectedAffiliatePopup.link) {
      logAffiliateLinkClick(0, selectedAffiliatePopup);
      window.open(selectedAffiliatePopup.link, '_blank');
    }
    handleInitialPopupClose(); 
  };

  useEffect(() => {
    if (isChatbotVisible && messages.length === 0) {
      addMessage('assistant', "Bienvenue ! Pose-moi tes questions sur la musculation. Je serai concis.");
    }
  }, [isChatbotVisible, messages]); 

  useEffect(() => {
    if (isChatbotVisible && !isInitialPopupOpen) {
      periodicPopupIntervalRef.current = setInterval(() => {
        if (!isPeriodicPopupOpen && !isInitialPopupOpen) { 
          console.log("Déclenchement du popup périodique d'affiliation.");
          setIsPeriodicPopupOpen(true);
        }
      }, 60000); 
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
    if (!inputValue.trim() || isPeriodicPopupOpen) return; 

    const userMessageContent = inputValue;
    addMessage('user', userMessageContent);
    setInputValue('');
    setIsLoading(true);

    const historyForApi = messages.slice(-5); 
    const apiMessages = [
      { role: 'system', content: "Tu es un coach musculation. Donne des conseils pratiques et adaptés. Tes réponses doivent être concises et aller droit au but." }, 
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
          onClose={handleInitialPopupClose} 
          onProceed={handleInitialPopupClose} 
          proceedButtonText="Accéder au Chatbot" // Texte personnalisé pour ce bouton
          imageSrc={selectedAffiliatePopup.image}
          affiliateLink={selectedAffiliatePopup.link}
          buttonText={selectedAffiliatePopup.buttonText} 
          title={selectedAffiliatePopup.title}
          description={selectedAffiliatePopup.description}
          onAffiliateLinkClick={handleInitialAffiliateClick} 
        />
      )}

      {isPeriodicPopupOpen && selectedAffiliatePopup && (
        <AffiliatePopup
          isOpen={isPeriodicPopupOpen}
          onClose={() => setIsPeriodicPopupOpen(false)}
          onProceed={() => setIsPeriodicPopupOpen(false)} 
          // proceedButtonText utilisera "Continuer" par défaut
          imageSrc={selectedAffiliatePopup.image}
          affiliateLink={selectedAffiliatePopup.link}
          buttonText={selectedAffiliatePopup.buttonText}
          title={selectedAffiliatePopup.title}
          description={selectedAffiliatePopup.description}
          onAffiliateLinkClick={() => { 
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
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Conseil</AlertTitle>
              <AlertDescription>
                Besoin d'un plan d'entraînement complet et sur mesure ? Essayez notre <Link to="/" className="font-semibold text-primary hover:underline">Générateur de Programme</Link> !
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Note: La clé API Groq est utilisée côté client pour la démonstration. 
              Dans une application de production, elle devrait être sécurisée côté serveur.
            </p>
          </>
        )}
        {!isChatbotVisible && !isInitialPopupOpen && (
             <div className="flex-grow flex items-center justify-center">
                <p>Chargement du chatbot...</p> 
            </div>
        )}
      </div>
    </>
  );
};

export default ChatbotPage;