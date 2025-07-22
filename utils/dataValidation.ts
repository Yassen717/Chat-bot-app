import { Chat, Message, Task, UserProfile } from '@/types';

/**
 * Validation utilities for data models
 */

/**
 * Validate Message object
 */
export function validateMessage(message: any): message is Message {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof message.id === 'string' &&
    typeof message.text === 'string' &&
    typeof message.isUser === 'boolean' &&
    message.timestamp instanceof Date &&
    typeof message.chatId === 'string'
  );
}

/**
 * Validate Chat object
 */
export function validateChat(chat: any): chat is Chat {
  return (
    typeof chat === 'object' &&
    chat !== null &&
    typeof chat.id === 'string' &&
    typeof chat.title === 'string' &&
    typeof chat.lastMessage === 'string' &&
    chat.lastMessageTime instanceof Date &&
    Array.isArray(chat.messages) &&
    chat.messages.every(validateMessage)
  );
}

/**
 * Validate Task object
 */
export function validateTask(task: any): task is Task {
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    (task.description === undefined || typeof task.description === 'string') &&
    typeof task.completed === 'boolean' &&
    task.createdAt instanceof Date &&
    (task.fromChatId === undefined || typeof task.fromChatId === 'string')
  );
}

/**
 * Validate UserProfile object
 */
export function validateUserProfile(profile: any): profile is UserProfile {
  return (
    typeof profile === 'object' &&
    profile !== null &&
    (profile.name === undefined || typeof profile.name === 'string') &&
    (profile.avatar === undefined || typeof profile.avatar === 'string') &&
    typeof profile.preferences === 'object' &&
    profile.preferences !== null &&
    ['light', 'dark', 'auto'].includes(profile.preferences.theme) &&
    typeof profile.preferences.notifications === 'boolean' &&
    typeof profile.preferences.aiModel === 'string'
  );
}

/**
 * Sanitize and transform data from AsyncStorage
 * Handles date string conversion and data validation
 */
export function sanitizeStorageData<T>(
  data: any,
  validator: (item: any) => item is T
): T[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      // Convert date strings back to Date objects
      if (item.timestamp && typeof item.timestamp === 'string') {
        item.timestamp = new Date(item.timestamp);
      }
      if (item.lastMessageTime && typeof item.lastMessageTime === 'string') {
        item.lastMessageTime = new Date(item.lastMessageTime);
      }
      if (item.createdAt && typeof item.createdAt === 'string') {
        item.createdAt = new Date(item.createdAt);
      }
      
      // Handle nested messages in chats
      if (item.messages && Array.isArray(item.messages)) {
        item.messages = item.messages.map((msg: any) => {
          if (msg.timestamp && typeof msg.timestamp === 'string') {
            msg.timestamp = new Date(msg.timestamp);
          }
          return msg;
        });
      }

      return item;
    })
    .filter(validator);
}

/**
 * Generate unique ID for new items
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create default user profile
 */
export function createDefaultUserProfile(): UserProfile {
  return {
    preferences: {
      theme: 'auto',
      notifications: true,
      aiModel: 'gpt-3.5-turbo',
    },
  };
}