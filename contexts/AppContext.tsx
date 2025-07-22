import React, { ReactNode } from 'react';
import { ChatProvider } from './ChatContext';
import { TaskProvider } from './TaskContext';
import { ProfileProvider } from './ProfileContext';

/**
 * AppProvider combines all context providers
 * This ensures proper provider hierarchy and makes it easy to wrap the entire app
 */
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ProfileProvider>
      <ChatProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </ChatProvider>
    </ProfileProvider>
  );
}

// Re-export all hooks for convenience
export { useChatContext } from './ChatContext';
export { useTaskContext } from './TaskContext';
export { useProfileContext } from './ProfileContext';

// Re-export individual providers if needed
export { ChatProvider } from './ChatContext';
export { TaskProvider } from './TaskContext';
export { ProfileProvider } from './ProfileContext';