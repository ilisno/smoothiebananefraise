import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  isInputDisabled?: boolean; // Nouvelle prop
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  isInputDisabled = false, // Valeur par défaut
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && !isInputDisabled) {
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] border rounded-lg shadow-sm">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.filter(msg => msg.role !== 'system').map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      {isLoading && (
        <div className="p-2 text-center text-sm text-muted-foreground flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          L'IA réfléchit...
        </div>
      )}
      <div className={cn(
        "border-t p-4 flex items-center gap-2",
        isInputDisabled && "opacity-50 cursor-not-allowed" // Style pour l'état désactivé
      )}>
        <Input
          type="text"
          placeholder={isInputDisabled ? "Veuillez fermer le popup pour continuer..." : "Posez votre question ici..."}
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading || isInputDisabled}
          className="flex-grow"
        />
        <Button onClick={onSendMessage} disabled={isLoading || isInputDisabled || !inputValue.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;