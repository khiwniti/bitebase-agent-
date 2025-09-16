import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

const UserIcon = () => <div className="w-7 h-7 rounded-full flex-shrink-0 border-2" style={{backgroundColor: 'var(--primary)', borderColor: 'var(--border)'}} />;
const AiIcon = () => <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2" style={{backgroundColor: 'var(--muted)', borderColor: 'var(--border)'}}>🤖</div>;


interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const messageContent = message.isHtml ? (
    <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: message.content }} />
  ) : (
    <p>{message.content}</p>
  );

  return (
    <div className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? <UserIcon /> : <AiIcon />}
      <div className={`text-sm leading-relaxed shadow-sm ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        {messageContent}
      </div>
    </div>
  );
};

interface SuggestionButtonProps {
    onClick: () => void;
    children: React.ReactNode;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="w-full border text-left text-xs sm:text-sm hover:border-primary/50 transition-all duration-200 p-2 rounded-md"
        style={{
            backgroundColor: 'var(--muted)',
            borderColor: 'var(--border)',
            color: 'var(--bitebase-text-secondary)',
        }}
    >
        {children}
    </button>
);

const ThinkingIndicator = () => (
    <div className="flex items-start gap-3 mb-4">
        <AiIcon />
        <div className="p-3 rounded-lg self-start" style={{backgroundColor: 'var(--muted)'}}>
            <div className="bitebase-spinner" />
        </div>
    </div>
);


interface ChatSectionProps {
  messages: ChatMessage[];
  isAiThinking: boolean;
  onSendMessage: (message: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ messages, isAiThinking, onSendMessage }) => {
  const chatContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  const suggestions = [
    { text: 'Analyze competitors near me.', emoji: '📊' },
    { text: 'Find market gaps.', emoji: '🗺️' },
    { text: 'Low competition for Italian food?', emoji: '🍝' },
    { text: 'Show price distribution.', emoji: '💰' },
  ];

  return (
    <section 
        className="w-full md:w-[350px] lg:w-[400px] shadow-lg flex flex-col overflow-hidden"
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(15px)',
            borderRadius: 'var(--bitebase-radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
    >
      <header 
        className="p-4 font-semibold text-center border-b"
        style={{color: 'var(--bitebase-primary)', borderColor: 'var(--border)'}}
      >
        🤖 AI Copilot
      </header>
      
      <div ref={chatContentRef} className="flex-1 p-3 sm:p-5 overflow-y-auto scrollbar-custom">
        {messages.map(msg => (
          <Message key={msg.id} message={msg} />
        ))}
        {isAiThinking && <ThinkingIndicator />}
      </div>

      <div 
        className="p-3 sm:p-4 border-t"
        style={{
            borderColor: 'var(--border)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
        }}
      >
        <h4 className="mb-3 text-sm font-semibold" style={{color: 'var(--bitebase-primary)'}}>💡 Quick Prompts:</h4>
        <div className="grid grid-cols-2 gap-2">
            {suggestions.map(s => (
                <SuggestionButton key={s.text} onClick={() => onSendMessage(s.text)}>
                   <span className="mr-2">{s.emoji}</span>{s.text}
                </SuggestionButton>
            ))}
        </div>
      </div>
    </section>
  );
};