import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2 } from 'lucide-react'; // Icons for send and loading
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

// Define message types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CoachVirtuel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bienvenue dans ton chat de musculation. Comment puis-je t'aider aujourd'hui ?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: inputMessage };
    // Add user message immediately to the state
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage(''); // Clear input field
    setIsLoading(true);

    try {
      // Prepare messages for the API (last 5 messages + new user message)
      // The system message is added in the Edge Function
      const history = messages.slice(-5); // Get last 5 messages
      const messagesToSend = [...history, newUserMessage];

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { messages: messagesToSend },
      });

      if (error) {
        console.error("Error invoking Edge Function:", error);
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: "Désolé, une erreur est survenue lors de la communication avec le coach virtuel." }
        ]);
      } else {
        // Add AI response to the state
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: data.assistantMessage }
        ]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: "Désolé, une erreur inattendue est survenue." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col max-w-3xl">
        <Card className="flex flex-col flex-grow shadow-lg">
          <CardContent className="flex flex-col flex-grow p-4 h-[60vh] overflow-y-auto"> {/* Fixed height and scrolling */}
            <div className="flex flex-col space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-sbf-red text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-lg bg-gray-200 text-gray-800 flex items-center">
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Le coach réfléchit...
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} /> {/* Element to scroll into view */}
            </div>
          </CardContent>
          <div className="p-4 border-t bg-white"> {/* Input area */}
            <div className="flex space-x-2">
              <Input
                placeholder="Posez votre question au coach..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-grow"
              />
              <Button onClick={sendMessage} disabled={isLoading}>
                <Send size={20} />
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default CoachVirtuel;