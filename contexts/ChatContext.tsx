import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Chat, Message } from '@/types';
import { chatService } from '@/services';

// State interface
interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
}

// Action types
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } };

// Context interface
interface ChatContextType {
  state: ChatState;
  actions: {
    loadChats: () => Promise<void>;
    createChat: (title: string) => Promise<Chat>;
    selectChat: (chatId: string) => Promise<void>;
    updateChat: (chat: Chat) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    addMessage: (chatId: string, messageData: Omit<Message, 'id' | 'chatId'>) => Promise<Message>;
    searchChats: (query: string) => Promise<Chat[]>;
    clearError: () => void;
  };
}

// Initial state
const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CHATS':
      return { ...state, chats: action.payload, loading: false };
    
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload };
    
    case 'ADD_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        currentChat: action.payload,
      };
    
    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id ? action.payload : chat
        ),
        currentChat: state.currentChat?.id === action.payload.id 
          ? action.payload 
          : state.currentChat,
      };
    
    case 'DELETE_CHAT':
      return {
        ...state,
        chats: state.chats.filter(chat => chat.id !== action.payload),
        currentChat: state.currentChat?.id === action.payload 
          ? null 
          : state.currentChat,
      };
    
    case 'ADD_MESSAGE':
      const { chatId, message } = action.payload;
      return {
        ...state,
        chats: state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
            };
          }
          return chat;
        }),
        currentChat: state.currentChat?.id === chatId
          ? {
              ...state.currentChat,
              messages: [...state.currentChat.messages, message],
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
            }
          : state.currentChat,
      };
    
    default:
      return state;
  }
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Actions
  const loadChats = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const chats = await chatService.getChats();
      dispatch({ type: 'SET_CHATS', payload: chats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load chats' });
      console.error('Error loading chats:', error);
    }
  };

  const createChat = async (title: string): Promise<Chat> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newChat = await chatService.createChat(title);
      dispatch({ type: 'ADD_CHAT', payload: newChat });
      return newChat;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create chat' });
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      const chat = await chatService.getChat(chatId);
      dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load chat' });
      console.error('Error selecting chat:', error);
    }
  };

  const updateChat = async (chat: Chat) => {
    try {
      await chatService.updateChat(chat);
      dispatch({ type: 'UPDATE_CHAT', payload: chat });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update chat' });
      console.error('Error updating chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId);
      dispatch({ type: 'DELETE_CHAT', payload: chatId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete chat' });
      console.error('Error deleting chat:', error);
    }
  };

  const addMessage = async (
    chatId: string, 
    messageData: Omit<Message, 'id' | 'chatId'>
  ): Promise<Message> => {
    try {
      const message = await chatService.addMessage(chatId, messageData);
      dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message } });
      return message;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
      console.error('Error adding message:', error);
      throw error;
    }
  };

  const searchChats = async (query: string): Promise<Chat[]> => {
    try {
      return await chatService.searchChats(query);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search chats' });
      console.error('Error searching chats:', error);
      return [];
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: ChatContextType = {
    state,
    actions: {
      loadChats,
      createChat,
      selectChat,
      updateChat,
      deleteChat,
      addMessage,
      searchChats,
      clearError,
    },
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook to use chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}