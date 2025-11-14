import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  contactAvatar?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, contactAvatar }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
      case 'sending':
        return <span className="text-slate-400">🕐</span>;
      case 'sent':
        return <span className="text-slate-400">✓</span>;
      case 'delivered':
        return <span className="text-slate-400">✓✓</span>;
      case 'read':
        return <span className="text-blue-400">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-end gap-2 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
          {contactAvatar}
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg px-3 py-2 ${
          isOwn
            ? 'bg-[#005c4b] text-white rounded-br-none'
            : 'bg-[#202c33] text-slate-100 rounded-bl-none'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-slate-400">{formatTime(message.timestamp)}</span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
