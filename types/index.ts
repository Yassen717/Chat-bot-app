// Core data models and interfaces for the chat-bot app

// Chat Interfaces
export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  chatId: string;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  lastMessageTime: Date;
  messages: Message[];
}

// Task Interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  fromChatId?: string;
}

// User Profile Interface
export interface UserProfile {
  name?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    aiModel: string;
  };
}

// Service Interfaces
export interface ChatService {
  getChats(): Promise<Chat[]>;
  getChat(id: string): Promise<Chat | null>;
  createChat(title: string): Promise<Chat>;
  updateChat(chat: Chat): Promise<void>;
  deleteChat(id: string): Promise<void>;
  addMessage(chatId: string, message: Omit<Message, 'id' | 'chatId'>): Promise<Message>;
}

export interface TaskService {
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  toggleTaskCompletion(id: string): Promise<void>;
}

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(profile: Partial<UserProfile>): Promise<void>;
  clearData(): Promise<void>;
  exportData(): Promise<string>;
}

export interface AIService {
  sendMessage(message: string): Promise<string>;
  isAvailable(): boolean;
  getTypingDelay(): number;
}

// AsyncStorage operation types
export interface StorageManager {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// AsyncStorage keys
export const STORAGE_KEYS = {
  CHATS: '@chats',
  TASKS: '@tasks',
  USER_PROFILE: '@userProfile',
  APP_SETTINGS: '@appSettings',
} as const;

// App Settings Interface
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  aiModel: string;
  firstLaunch: boolean;
}