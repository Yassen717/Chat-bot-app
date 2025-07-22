// Export all services for easy importing
export { chatService } from './ChatService';
export { taskService } from './TaskService';
export { profileService } from './ProfileService';

// Re-export types for convenience
export type {
  Chat,
  Message,
  Task,
  UserProfile,
  ChatService,
  TaskService,
  ProfileService,
} from '@/types';