import { Conversation, ConversationType, User } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah Connor', status: 'online', avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'John Doe', status: 'away', avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Alex Rivera', status: 'busy', avatar: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', name: 'Elena Gilbert', status: 'offline', avatar: 'https://i.pravatar.cc/150?u=u4' },
];

export const MOCK_CHANNELS: Conversation[] = [
  { id: 'c1', name: 'general', type: ConversationType.CHANNEL, lastMessage: 'Welcome to the team!', unreadCount: 2 },
  { id: 'c2', name: 'engineering', type: ConversationType.CHANNEL, lastMessage: 'PR #45 is ready for review', unreadCount: 0 },
  { id: 'c3', name: 'design-system', type: ConversationType.CHANNEL, lastMessage: 'Updated the primary button tokens', unreadCount: 5 },
  { id: 'c4', name: 'marketing-sync', type: ConversationType.CHANNEL, lastMessage: 'Meeting in 10 mins', unreadCount: 0 },
];

export const MOCK_DMS: Conversation[] = [
  { id: 'd1', name: 'Sarah Connor', type: ConversationType.DIRECT, avatar: 'https://i.pravatar.cc/150?u=u1', lastMessage: 'Hey, did you see the report?', unreadCount: 1 },
  { id: 'd2', name: 'John Doe', type: ConversationType.DIRECT, avatar: 'https://i.pravatar.cc/150?u=u2', lastMessage: 'Thanks for the help!', unreadCount: 0 },
];

export const INITIAL_MESSAGES = {
  'c1': [
    { id: 'm1', senderId: 'u1', senderName: 'Sarah Connor', text: 'Hello everyone!', timestamp: '10:00 AM', avatar: 'https://i.pravatar.cc/150?u=u1' },
    { id: 'm2', senderId: 'u2', senderName: 'John Doe', text: 'Hey Sarah, welcome!', timestamp: '10:05 AM', avatar: 'https://i.pravatar.cc/150?u=u2' },
  ],
  'c2': [
    { id: 'm3', senderId: 'u3', senderName: 'Alex Rivera', text: 'The new tab system is looking great.', timestamp: '11:30 AM', avatar: 'https://i.pravatar.cc/150?u=u3' },
  ],
};
