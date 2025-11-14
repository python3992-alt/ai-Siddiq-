import { Chat, Contact, Message, User } from '../types';

// Current user
export const currentUser: User = {
  id: 'user-1',
  name: 'Saya',
  avatar: '👤',
  status: 'online',
  about: 'Hey there! I am using WhatsApp',
};

// Mock contacts
export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'Budi Santoso',
    avatar: '👨',
    status: 'online',
    phoneNumber: '+62 812-3456-7890',
    about: 'Busy',
  },
  {
    id: 'contact-2',
    name: 'Siti Nurhaliza',
    avatar: '👩',
    status: 'online',
    phoneNumber: '+62 813-4567-8901',
    about: 'Available',
  },
  {
    id: 'contact-3',
    name: 'Ahmad Wijaya',
    avatar: '🧑',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    phoneNumber: '+62 814-5678-9012',
    about: 'At work',
  },
  {
    id: 'contact-4',
    name: 'Dewi Lestari',
    avatar: '👩‍💼',
    status: 'online',
    phoneNumber: '+62 815-6789-0123',
    about: 'Coffee lover ☕',
  },
  {
    id: 'contact-5',
    name: 'Rudi Hartono',
    avatar: '👨‍💻',
    status: 'offline',
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    phoneNumber: '+62 816-7890-1234',
    about: 'Developer',
  },
];

// Auto-reply messages
const autoReplyMessages: { [key: string]: string[] } = {
  'contact-1': [
    'Halo! Apa kabar?',
    'Gimana nih?',
    'Oke deh, nanti kita ngobrol lagi ya',
    'Siap!',
  ],
  'contact-2': [
    'Hai! Lagi sibuk nih',
    'Bentar ya, lagi meeting',
    'Oke, nanti aku kabarin',
    'Thanks!',
  ],
  'contact-3': [
    'Maaf baru bales',
    'Lagi di jalan nih',
    'Oke, sampai jumpa!',
  ],
  'contact-4': [
    'Halo! Ada yang bisa dibantu?',
    'Wah menarik!',
    'Oke, noted',
  ],
  'contact-5': [
    'Yo! What\'s up?',
    'Cool!',
    'Alright, catch you later',
  ],
};

// Initialize chats from localStorage or create new
export const initializeChats = (): Chat[] => {
  const stored = localStorage.getItem('whatsapp-chats');
  if (stored) {
    return JSON.parse(stored);
  }

  // Create initial chats with some messages
  const initialChats: Chat[] = [
    {
      id: 'chat-1',
      contactId: 'contact-1',
      unreadCount: 2,
      messages: [
        {
          id: 'msg-1',
          chatId: 'chat-1',
          senderId: 'contact-1',
          content: 'Halo! Apa kabar?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'read',
          type: 'text',
        },
        {
          id: 'msg-2',
          chatId: 'chat-1',
          senderId: 'user-1',
          content: 'Baik! Kamu gimana?',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          status: 'read',
          type: 'text',
        },
        {
          id: 'msg-3',
          chatId: 'chat-1',
          senderId: 'contact-1',
          content: 'Alhamdulillah baik juga',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          status: 'delivered',
          type: 'text',
        },
      ],
      unreadCount: 1,
    },
    {
      id: 'chat-2',
      contactId: 'contact-2',
      unreadCount: 0,
      messages: [
        {
          id: 'msg-4',
          chatId: 'chat-2',
          senderId: 'user-1',
          content: 'Hai Siti!',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'read',
          type: 'text',
        },
        {
          id: 'msg-5',
          chatId: 'chat-2',
          senderId: 'contact-2',
          content: 'Hai! Ada apa?',
          timestamp: new Date(Date.now() - 7100000).toISOString(),
          status: 'read',
          type: 'text',
        },
      ],
      unreadCount: 0,
    },
  ];

  // Set lastMessage for each chat
  initialChats.forEach(chat => {
    if (chat.messages.length > 0) {
      chat.lastMessage = chat.messages[chat.messages.length - 1];
    }
  });

  saveChats(initialChats);
  return initialChats;
};

export const saveChats = (chats: Chat[]) => {
  localStorage.setItem('whatsapp-chats', JSON.stringify(chats));
};

export const sendMessage = (
  chats: Chat[],
  chatId: string,
  content: string,
  senderId: string = currentUser.id
): Chat[] => {
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    chatId,
    senderId,
    content,
    timestamp: new Date().toISOString(),
    status: 'sent',
    type: 'text',
  };

  const updatedChats = chats.map(chat => {
    if (chat.id === chatId) {
      const updatedMessages = [...chat.messages, newMessage];
      return {
        ...chat,
        messages: updatedMessages,
        lastMessage: newMessage,
      };
    }
    return chat;
  });

  saveChats(updatedChats);
  return updatedChats;
};

export const markMessagesAsRead = (chats: Chat[], chatId: string): Chat[] => {
  const updatedChats = chats.map(chat => {
    if (chat.id === chatId) {
      const updatedMessages = chat.messages.map(msg => ({
        ...msg,
        status: msg.senderId !== currentUser.id ? 'read' : msg.status,
      } as Message));
      return {
        ...chat,
        messages: updatedMessages,
        unreadCount: 0,
      };
    }
    return chat;
  });

  saveChats(updatedChats);
  return updatedChats;
};

export const updateMessageStatus = (
  chats: Chat[],
  messageId: string,
  status: Message['status']
): Chat[] => {
  const updatedChats = chats.map(chat => ({
    ...chat,
    messages: chat.messages.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    ),
  }));

  saveChats(updatedChats);
  return updatedChats;
};

export const createNewChat = (chats: Chat[], contactId: string): Chat[] => {
  // Check if chat already exists
  const existingChat = chats.find(chat => chat.contactId === contactId);
  if (existingChat) {
    return chats;
  }

  const newChat: Chat = {
    id: `chat-${Date.now()}`,
    contactId,
    messages: [],
    unreadCount: 0,
  };

  const updatedChats = [newChat, ...chats];
  saveChats(updatedChats);
  return updatedChats;
};

export const setTypingStatus = (
  chats: Chat[],
  chatId: string,
  isTyping: boolean
): Chat[] => {
  return chats.map(chat =>
    chat.id === chatId ? { ...chat, isTyping } : chat
  );
};

// Simulate auto-reply from contact
export const simulateAutoReply = (
  chats: Chat[],
  chatId: string,
  contactId: string,
  onUpdate: (chats: Chat[]) => void
) => {
  const replies = autoReplyMessages[contactId] || ['Oke!'];
  const randomReply = replies[Math.floor(Math.random() * replies.length)];

  // Set typing status
  setTimeout(() => {
    const chatsWithTyping = setTypingStatus(chats, chatId, true);
    onUpdate(chatsWithTyping);

    // Send reply after typing
    setTimeout(() => {
      const chatsWithoutTyping = setTypingStatus(chatsWithTyping, chatId, false);
      const updatedChats = sendMessage(chatsWithoutTyping, chatId, randomReply, contactId);
      
      // Update unread count
      const finalChats = updatedChats.map(chat => {
        if (chat.id === chatId) {
          return { ...chat, unreadCount: chat.unreadCount + 1 };
        }
        return chat;
      });

      onUpdate(finalChats);
      saveChats(finalChats);
    }, 2000 + Math.random() * 2000);
  }, 1000 + Math.random() * 2000);
};
