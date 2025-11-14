import React, { useState } from 'react';
import { Chat, Contact } from '../types';
import { currentUser } from '../services/chatService';

interface ChatListProps {
  chats: Chat[];
  contacts: Contact[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: (contactId: string) => void;
  onClose?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  contacts,
  activeChat,
  onSelectChat,
  onNewChat,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const getContact = (contactId: string) => {
    return contacts.find(c => c.id === contactId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Kemarin';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('id-ID', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };

  const filteredChats = chats.filter(chat => {
    const contact = getContact(chat.contactId);
    return contact?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const availableContacts = contacts.filter(
    contact => !chats.some(chat => chat.contactId === contact.id)
  );

  const handleNewChat = (contactId: string) => {
    onNewChat(contactId);
    setShowNewChatModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21]">
      {/* Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
            {currentUser.avatar}
          </div>
          <h1 className="text-white font-semibold text-xl">WhatsApp</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Chat baru"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-2 bg-[#111b21]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari atau mulai chat baru"
            className="w-full bg-[#202c33] text-slate-100 rounded-lg pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00a884]"
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center">
            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">Belum ada chat</p>
            <p className="text-sm">Mulai chat baru dengan kontak Anda</p>
          </div>
        ) : (
          filteredChats.map(chat => {
            const contact = getContact(chat.contactId);
            if (!contact) return null;

            const lastMessage = chat.lastMessage;
            const isActive = activeChat?.id === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                    {contact.avatar}
                  </div>
                  {contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0 border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-semibold truncate">{contact.name}</h3>
                    {lastMessage && (
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400 truncate flex-1">
                      {lastMessage ? (
                        <>
                          {lastMessage.senderId === currentUser.id && (
                            <span className="mr-1">
                              {lastMessage.status === 'read' ? '✓✓' : '✓'}
                            </span>
                          )}
                          {lastMessage.content}
                        </>
                      ) : (
                        'Belum ada pesan'
                      )}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-[#00a884] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#202c33] rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-white text-lg font-semibold">Pilih Kontak</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {availableContacts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Semua kontak sudah ada di chat
                </div>
              ) : (
                availableContacts.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => handleNewChat(contact.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#2a3942] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
                      {contact.avatar}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{contact.name}</h3>
                      <p className="text-sm text-slate-400">{contact.about}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
