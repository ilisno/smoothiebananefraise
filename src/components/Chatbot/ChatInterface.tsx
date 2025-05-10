import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';

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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
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
      <div className="border-t p-4 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Posez votre question ici..."
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-grow"
        />
        <Button onClick={onSendMessage} disabled={isLoading || !inputValue.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;