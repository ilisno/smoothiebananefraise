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
  const [isInitialPopupOpen, setIsInitialPopupOpen] = useState(true); // Reste true initialement
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
    setIsSubmittingEmail(true);

    if (emailInputValue.toLowerCase() === 'b') {
      console.log("Bypassing Supabase insertion for test email 'b' for Coach Virtuel.");
      setUserEmail('b'); 
      setIsInitialPopupOpen(true); 
      toast({ title: "Accès direct (test)", description: "Vous pouvez maintenant accéder au coach virtuel." });
      setIsSubmittingEmail(false);
      return;
    }

    if (!emailInputValue.trim() || !/\S+@\S+\.\S+/.test(emailInputValue)) {
      setEmailError("Veuillez entrer une adresse email valide.");
      setIsSubmittingEmail(false);
      return;
    }

    try {
      const { error: subscriberError } = await supabase
        .from('subscribers')
        .insert({ email: emailInputValue }, { upsert: true });

      if (subscriberError && subscriberError.code !== '23505') { 
        throw subscriberError;
      }
      
      setUserEmail(emailInputValue);
      setIsInitialPopupOpen(true); 
      
      toast({ title: "Email enregistré !", description: "Vous pouvez maintenant accéder au coach virtuel." });
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
    // Si userEmail est défini (par une soumission valide ou 'b'), et que le popup initial n'est PAS ouvert,
    // alors on peut considérer que l'utilisateur a passé l'étape de l'email/popup.
    if (userEmail && !isInitialPopupOpen) {
        setIsChatbotVisible(true);
        if (messages.length === 0) {
             addMessage('assistant', "Bienvenue ! Pose-moi tes questions sur la musculation. Je serai concis.");
        }
    }
  }, [userEmail, isInitialPopupOpen, messages.length]); // Dépendances ajustées


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
    if (!userEmail || userEmail.toLowerCase() === 'b') return; 
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
      { role: 'system', content: "Tu es un coach musculation virtuel. Donne des conseils pratiques et adaptés. Tes réponses doivent être concises et aller droit au but." }, 
      ...historyForApi.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: userMessageContent },
    ];
    
    try {
      console.log("[ChatbotPage] Invoking Supabase Edge Function 'groq-proxy' with payload:", {
        model: "llama3-70b-8192",
        messages: apiMessages,
        temperature: 0.7,
      });

      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('groq-proxy', {
        body: {
          model: "llama3-70b-8192",
          messages: apiMessages,
          temperature: 0.7,
        }
      });

      if (functionError) {
        console.error("[ChatbotPage] Edge Function Error:", functionError);
        throw new Error(`Erreur de la fonction Edge: ${functionError.message}`);
      }

      console.log("[ChatbotPage] Received from Edge Function:", functionResponse);

      if (functionResponse.choices && functionResponse.choices.length > 0 && functionResponse.choices[0].message) {
        const aiResponse = functionResponse.choices[0].message.content;
        addMessage('assistant', aiResponse);
        await logConversation(userMessageContent, aiResponse);
      } else if (functionResponse.error) {
        const groqErrorMessage = typeof functionResponse.error === 'string' ? functionResponse.error : (functionResponse.error.message || "Erreur inconnue de l'API Groq via proxy");
        throw new Error(`Erreur de l'API Groq (via proxy): ${groqErrorMessage}`);
      } else {
        throw new Error("Réponse invalide de la fonction Edge.");
      }
    } catch (error) {
      console.error('[ChatbotPage] Error during handleSendMessage:', error);
      const errMsg = error instanceof Error ? error.message : "Erreur inconnue.";
      addMessage('assistant', `Désolé, une erreur est survenue : ${errMsg}`);
      toast({ title: "Erreur Coach Virtuel", description: `Impossible de contacter le coach virtuel : ${errMsg}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, toast, isPeriodicPopupOpen, userEmail]);

  return (
    <>
      <Helmet>
        <title>Coach Virtuel Musculation - Conseils Instantanés | Smoothie Banane Fraise</title>
        <meta name="description" content="Discutez avec notre coach musculation virtuel pour obtenir des conseils personnalisés et des réponses instantanées à vos questions sur l'entraînement et la nutrition." />
        <meta name="keywords" content="coach virtuel musculation, chatbot fitness, conseils musculation, nutrition sportive IA, entraînement personnalisé IA" />
      </Helmet>
      
      <div className="container mx-auto py-4 md:py-8 flex flex-col" style={{ minHeight: 'calc(100vh - 4rem)'}}> 
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Coach Virtuel Musculation
          </h1>
          <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Obtenez des réponses rapides à toutes vos questions sur la musculation, la nutrition et l'entraînement grâce à notre Coach Virtuel. Un expert IA à votre service pour optimiser votre progression.
          </p>
        </header>

        {!userEmail && (
          <div className="flex flex-col items-center justify-center flex-grow">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Accéder au Coach Virtuel</CardTitle>
                <CardDescription>Veuillez entrer votre adresse email pour commencer à discuter.</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email-chatbot" className="text-sm font-medium">Adresse email</label>
                    <Input
                      id="email-chatbot"
                      type="text" // Changé de "email" à "text"
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
                    Accéder au Coach Virtuel
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      
        {userEmail && isInitialPopupOpen && selectedAffiliatePopup && (
          <AffiliatePopup
            isOpen={isInitialPopupOpen}
            onClose={handleInitialPopupClose} 
            onProceed={handleInitialPopupClose} 
            proceedButtonText="Accéder au Coach Virtuel"
            imageSrc={selectedAffiliatePopup.image}
            affiliateLink={selectedAffiliatePopup.link}
            buttonText={selectedAffiliatePopup.buttonText} 
            title={selectedAffiliatePopup.title}
            description={selectedAffiliatePopup.description}
            onAffiliateLinkClick={handleInitialAffiliateClick} 
          />
        )}

        {userEmail && isPeriodicPopupOpen && selectedAffiliatePopup && (
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

        {userEmail && isChatbotVisible && !isInitialPopupOpen && (
          <>
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-4 md:mb-6">
              Pose tes questions muscu / nutrition et obtient ta réponse instantanément.
            </h2>
            <div className="flex-grow" style={{ height: 'calc(100vh - 20rem)' }}> 
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
          </>
        )}
        {/* Fallback pour le chargement si userEmail est défini mais que le chatbot n'est pas encore visible */}
        {userEmail && !isChatbotVisible && !isInitialPopupOpen && (
             <div className="flex-grow flex items-center justify-center">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement du Coach virtuel...</p> 
            </div>
        )}
      </div>
    </>
  );
};

export default ChatbotPage;