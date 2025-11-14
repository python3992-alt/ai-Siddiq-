export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  about?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image';
}

export interface Chat {
  id: string;
  contactId: string;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
  isTyping?: boolean;
}

export interface Contact extends User {
  phoneNumber?: string;
}