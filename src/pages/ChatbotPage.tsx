import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import ChatInterface, { Message } from '@/components/Chatbot/ChatInterface';
import AffiliatePopup from '@/components/AffiliatePopup';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
    if (error) console.error('Error logging affiliate link click:', error);
    else console.log('Affiliate link click logged for:', data.title);
  } catch (e) { console.error('Exception logging affiliate click:', e); }
};

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailInputValue, setEmailInputValue] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [isInitialPopupOpen, setIsInitialPopupOpen] = useState(true); // Sera conditionné par la soumission de l'email
  const [isPeriodicPopupOpen, setIsPeriodicPopupOpen] = useState(false);
  
  const periodicPopupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const selectedAffiliatePopup = popupAffiliateData[0];

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role, content, id: Date.now().toString() + Math.random().toString() },
    ]);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    if (!emailInputValue.trim() || !/\S+@\S+\.\S+/.test(emailInputValue)) {
      setEmailError("Veuillez entrer une adresse email valide.");
      return;
    }
    setIsSubmittingEmail(true);
    try {
      // Tenter d'insérer l'email dans la table 'subscribers'
      const { error: subscriberError } = await supabase
        .from('subscribers')
        .insert({ email: emailInputValue }, { upsert: true }); // upsert pour éviter erreur si email existe déjà

      if (subscriberError && subscriberError.code !== '23505') { // 23505 est le code pour violation de contrainte unique
        throw subscriberError;
      }
      
      setUserEmail(emailInputValue);
      // Le popup d'affiliation s'ouvrira maintenant, puis le chatbot
      setIsInitialPopupOpen(true); // Déclenche le popup d'affiliation
      // isChatbotVisible sera mis à true par handleInitialPopupClose
      
      toast({ title: "Email enregistré !", description: "Vous pouvez maintenant accéder au chatbot." });
    } catch (error) {
      console.error('Error submitting email to Supabase:', error);
      setEmailError("Erreur lors de l'enregistrement de l'email. Veuillez réessayer.");
      toast({ title: "Erreur", description: "Impossible d'enregistrer l'email.", variant: "destructive" });
    } finally {
      setIsSubmittingEmail(false);
    }
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
    if (userEmail && isChatbotVisible && messages.length === 0) {
      addMessage('assistant', "Bienvenue ! Pose-moi tes questions sur la musculation. Je serai concis.");
    }
  }, [userEmail, isChatbotVisible, messages]); 

  useEffect(() => {
    if (userEmail && isChatbotVisible && !isInitialPopupOpen) {
      periodicPopupIntervalRef.current = setInterval(() => {
        if (!isPeriodicPopupOpen && !isInitialPopupOpen) { 
          setIsPeriodicPopupOpen(true);
        }
      }, 60000); 
    } else {
      if (periodicPopupIntervalRef.current) clearInterval(periodicPopupIntervalRef.current);
    }
    return () => {
      if (periodicPopupIntervalRef.current) clearInterval(periodicPopupIntervalRef.current);
    };
  }, [userEmail, isChatbotVisible, isInitialPopupOpen, isPeriodicPopupOpen]);

  const logConversation = async (userMsg: string, aiMsg: string) => {
    if (!userEmail) return;
    try {
      const { error } = await supabase.from('chatbot_conversations').insert({
        user_email: userEmail,
        user_message: userMsg,
        ai_response: aiMsg,
      });
      if (error) console.error('Error logging conversation:', error);
    } catch (e) { console.error('Exception logging conversation:', e); }
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isPeriodicPopupOpen || !userEmail) return; 

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
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: "llama3-70b-8192", messages: apiMessages, temperature: 0.7 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const aiResponse = data.choices[0].message.content;
        addMessage('assistant', aiResponse);
        await logConversation(userMessageContent, aiResponse); // Log la conversation
      } else {
        throw new Error("Réponse invalide de l'API Groq.");
      }
    } catch (error) {
      console.error('Erreur API Groq:', error);
      const errMsg = error instanceof Error ? error.message : "Erreur inconnue.";
      addMessage('assistant', `Désolé, une erreur est survenue : ${errMsg}`);
      toast({ title: "Erreur Chatbot", description: `Impossible de contacter l'IA : ${errMsg}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, toast, isPeriodicPopupOpen, userEmail]);

  if (!userEmail) {
    return (
      <>
        <Helmet>
          <title>Accès Chatbot Musculation | Smoothie Banane Fraise</title>
        </Helmet>
        <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accéder au Chatbot Musculation</CardTitle>
              <CardDescription>Veuillez entrer votre adresse email pour commencer à discuter avec notre coach IA.</CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email-chatbot" className="text-sm font-medium">Adresse email</label>
                  <Input
                    id="email-chatbot"
                    type="email"
                    placeholder="vous@email.com"
                    value={emailInputValue}
                    onChange={(e) => setEmailInputValue(e.target.value)}
                    required
                    disabled={isSubmittingEmail}
                  />
                  {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmittingEmail}>
                  {isSubmittingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Accéder au Chatbot
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </>
    );
  }

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
          proceedButtonText="Accéder au Chatbot"
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
        {!isChatbotVisible && !isInitialPopupOpen && userEmail && ( // Ajout de userEmail ici pour la condition
             <div className="flex-grow flex items-center justify-center">
                <p>Chargement du chatbot...</p> 
            </div>
        )}
      </div>
    </>
  );
};

export default ChatbotPage;