import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === 'user';
  const isSystem = role === 'system'; // System messages might not be displayed or styled differently

  if (isSystem) {
    return null; // Ou un style spécifique si vous voulez les afficher pour le debug
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 mb-4 p-3 rounded-lg max-w-[85%]",
        isUser ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted text-muted-foreground"
      )}
    >
      <Avatar className="w-8 h-8">
        {isUser ? (
          <User className="w-5 h-5 m-auto text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 m-auto text-muted-foreground" />
        )}
      </Avatar>
      <div className="prose prose-sm text-inherit whitespace-pre-wrap break-words">
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;