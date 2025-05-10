import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import ChatInterface, { Message } from '@/components/Chatbot/ChatInterface';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    addMessage('assistant', "Bienvenue dans ton chat de musculation. Comment puis-je t'aider aujourd'hui ?");
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessageContent = inputValue;
    addMessage('user', userMessageContent);
    setInputValue('');
    setIsLoading(true);

    // Préparer l'historique pour l'API (les 5 derniers messages + le message système)
    const historyForApi = messages.slice(-5); // Prend les 5 derniers messages
    const apiMessages = [
      { role: 'system', content: "Tu es un coach musculation. Donne des conseils pratiques et adaptés." },
      ...historyForApi.map(msg => ({ role: msg.role, content: msg.content })), // Ajoute l'historique existant
      { role: 'user', content: userMessageContent }, // Ajoute le nouveau message utilisateur
    ];
    
    // S'assurer de ne pas dépasser une certaine limite pour l'historique envoyé à l'API
    // (ici on prend les 5 derniers + system + nouveau user, donc 7 au max)
    // Si l'historique est plus long, on pourrait le tronquer davantage.
    // Pour cette implémentation, on envoie les 5 derniers messages de l'historique + le message système + le message utilisateur actuel.

    try {
      console.log("Sending to Groq API:", JSON.stringify({
        model: "mixtral-8x7b-32768",
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
          model: "mixtral-8x7b-32768",
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
      <div className="container mx-auto py-4 md:py-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)'}}> {/* 4rem est la hauteur du Header global */}
        {/* Menu simple */}
        <nav className="mb-4 pb-2 border-b">
          <ul className="flex items-center justify-center space-x-4 md:space-x-6">
            <li>
              <span className="text-lg font-semibold text-primary">Chatbot Musculation</span>
            </li>
            <li>
              <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
                {/* Le lien Outils peut pointer vers une future page ou être désactivé */}
                <Link to="/outils" onClick={(e) => { e.preventDefault(); toast({ title: "Bientôt disponible", description: "La section Outils arrive bientôt !" }); }}>Outils</Link>
              </Button>
            </li>
            <li>
              <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
                <Link to="/blog">Blog</Link>
              </Button>
            </li>
          </ul>
        </nav>

        <div className="flex-grow">
          <ChatInterface
            messages={messages}
            inputValue={inputValue}
            onInputChange={(e) => setInputValue(e.target.value)}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
         {/* Commentaire sur la clé API */}
         <p className="text-xs text-muted-foreground text-center mt-4">
            Note: La clé API Groq est utilisée côté client pour la démonstration. 
            Dans une application de production, elle devrait être sécurisée côté serveur.
          </p>
      </div>
    </>
  );
};

export default ChatbotPage;