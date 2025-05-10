import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import ChatInterface, { Message } from '@/components/Chatbot/ChatInterface';
// Link et Button ne sont plus nécessaires ici pour l'ancien menu
import { useToast } from "@/components/ui/use-toast";

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role, content, id: Date.now().toString() + Math.random().toString() },
    ]);
  };

  // Message d'introduction de l'IA
  useEffect(() => {
    // Ajoute le message d'introduction seulement si la conversation est vide
    // pour éviter de le répéter si l'utilisateur navigue ailleurs puis revient.
    if (messages.length === 0) {
      addMessage('assistant', "Bienvenue dans ton chat de musculation. Comment puis-je t'aider aujourd'hui ?");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuté une seule fois au montage

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessageContent = inputValue;
    addMessage('user', userMessageContent);
    setInputValue('');
    setIsLoading(true);

    const historyForApi = messages.slice(-5); 
    const apiMessages = [
      { role: 'system', content: "Tu es un coach musculation. Donne des conseils pratiques et adaptés." },
      ...historyForApi.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: userMessageContent },
    ];
    
    try {
      console.log("Sending to Groq API:", JSON.stringify({
        model: "llama3-70b-8192", // Modèle mis à jour
        messages: apiMessages,
        temperature: 0.7,
      }, null, 2));

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3-70b-8192", // Modèle mis à jour
          messages: apiMessages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq API Error:', errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Received from Groq API:", data);

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
  }, [inputValue, messages, toast]);


  return (
    <>
      <Helmet>
        <title>Chatbot Musculation | Smoothie Banane Fraise</title>
        <meta name="description" content="Discutez avec notre coach musculation IA pour obtenir des conseils personnalisés." />
      </Helmet>
      {/* Le container principal prendra toute la hauteur moins le header global */}
      <div className="container mx-auto py-4 md:py-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)'}}> 
        {/* Le menu de navigation spécifique au chatbot a été supprimé */}
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
      </div>
    </>
  );
};

export default ChatbotPage;