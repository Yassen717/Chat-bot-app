// Export main app provider and all hooks
export {
  AppProvider,
  useChatContext,
  useTaskContext,
  useProfileContext,
  ChatProvider,
  TaskProvider,
  ProfileProvider,
} from './AppContext';

// Re-export types for convenience
export type {
  Chat,
  Message,
  Task,
  UserProfile,
} from '@/types';