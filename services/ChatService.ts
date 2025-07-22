import { Chat, Message, ChatService as IChatService, STORAGE_KEYS } from '@/types';
import { storageManager } from '@/utils/StorageManager';
import { validateChat, sanitizeStorageData, generateId } from '@/utils/dataValidation';

/**
 * ChatService implementation for managing chat conversations and messages
 */
class ChatServiceImpl implements IChatService {
  /**
   * Get all chat conversations
   */
  async getChats(): Promise<Chat[]> {
    try {
      const chatsData = await storageManager.getItem<Chat[]>(STORAGE_KEYS.CHATS);
      if (!chatsData) {
        return [];
      }
      
      return sanitizeStorageData(chatsData, validateChat);
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  /**
   * Get a specific chat by ID
   */
  async getChat(id: string): Promise<Chat | null> {
    try {
      const chats = await this.getChats();
      return chats.find(chat => chat.id === id) || null;
    } catch (error) {
      console.error(`Error getting chat ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new chat conversation
   */
  async createChat(title: string): Promise<Chat> {
    try {
      const newChat: Chat = {
        id: generateId(),
        title: title.trim() || 'New Chat',
        lastMessage: '',
        lastMessageTime: new Date(),
        messages: [],
      };

      const chats = await this.getChats();
      chats.unshift(newChat); // Add to beginning of array
      
      await storageManager.setItem(STORAGE_KEYS.CHATS, chats);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  /**
   * Update an existing chat
   */
  async updateChat(updatedChat: Chat): Promise<void> {
    try {
      const chats = await this.getChats();
      const index = chats.findIndex(chat => chat.id === updatedChat.id);
      
      if (index === -1) {
        throw new Error(`Chat with id ${updatedChat.id} not found`);
      }

      chats[index] = updatedChat;
      await storageManager.setItem(STORAGE_KEYS.CHATS, chats);
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  /**
   * Delete a chat conversation
   */
  async deleteChat(id: string): Promise<void> {
    try {
      const chats = await this.getChats();
      const filteredChats = chats.filter(chat => chat.id !== id);
      
      await storageManager.setItem(STORAGE_KEYS.CHATS, filteredChats);
    } catch (error) {
      console.error(`Error deleting chat ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add a message to a chat conversation
   */
  async addMessage(
    chatId: string, 
    messageData: Omit<Message, 'id' | 'chatId'>
  ): Promise<Message> {
    try {
      const chat = await this.getChat(chatId);
      if (!chat) {
        throw new Error(`Chat with id ${chatId} not found`);
      }

      const newMessage: Message = {
        id: generateId(),
        chatId,
        ...messageData,
      };

      // Add message to chat
      chat.messages.push(newMessage);
      
      // Update chat metadata
      chat.lastMessage = messageData.text;
      chat.lastMessageTime = messageData.timestamp;

      // Save updated chat
      await this.updateChat(chat);
      
      return newMessage;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific chat with pagination
   */
  async getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]> {
    try {
      const chat = await this.getChat(chatId);
      if (!chat) {
        return [];
      }

      let messages = chat.messages;
      
      if (offset !== undefined) {
        messages = messages.slice(offset);
      }
      
      if (limit !== undefined) {
        messages = messages.slice(0, limit);
      }

      return messages;
    } catch (error) {
      console.error(`Error getting messages for chat ${chatId}:`, error);
      return [];
    }
  }

  /**
   * Search chats by title or message content
   */
  async searchChats(query: string): Promise<Chat[]> {
    try {
      const chats = await this.getChats();
      const lowercaseQuery = query.toLowerCase();
      
      return chats.filter(chat => 
        chat.title.toLowerCase().includes(lowercaseQuery) ||
        chat.messages.some(message => 
          message.text.toLowerCase().includes(lowercaseQuery)
        )
      );
    } catch (error) {
      console.error('Error searching chats:', error);
      return [];
    }
  }

  /**
   * Clear all chat data
   */
  async clearAllChats(): Promise<void> {
    try {
      await storageManager.removeItem(STORAGE_KEYS.CHATS);
    } catch (error) {
      console.error('Error clearing chats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatServiceImpl();