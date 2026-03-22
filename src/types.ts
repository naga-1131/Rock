export enum ConversationType {
  CHANNEL = 'CHANNEL',
  DIRECT = 'DIRECT',
  THREAD = 'THREAD',
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  name: string;
  type: ConversationType;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  isPinned?: boolean;
}

export interface Tab {
  id: string;
  conversationId: string;
  name: string;
  type: ConversationType;
  messages: Message[];
  draft: string;
  scrollPosition: number;
  isPinned: boolean;
  lastActive: number;
}

export interface User {
  id: string;
  name: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  avatar: string;
}
