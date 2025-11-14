import React from 'react';
import { Contact } from '../types';

interface ChatHeaderProps {
  contact: Contact;
  onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ contact, onBack }) => {
  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return '';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'terakhir dilihat baru saja';
    if (diffMins < 60) return `terakhir dilihat ${diffMins} menit yang lalu`;
    if (diffHours < 24) return `terakhir dilihat ${diffHours} jam yang lalu`;
    return `terakhir dilihat ${diffDays} hari yang lalu`;
  };

  return (
    <div className="bg-[#202c33] border-b border-slate-700 px-4 py-3 flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
        {contact.avatar}
      </div>
      
      <div className="flex-1 min-w-0">
        <h2 className="text-white font-semibold truncate">{contact.name}</h2>
        <p className="text-xs text-slate-400 truncate">
          {contact.status === 'online' ? (
            <span className="text-[#00a884]">online</span>
          ) : (
            formatLastSeen(contact.lastSeen)
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
