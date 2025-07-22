import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types';
import { profileService } from '@/services';

// State interface
interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  usageStats: {
    totalChats: number;
    totalMessages: number;
    totalTasks: number;
    completedTasks: number;
    storageUsed: string;
  } | null;
}

// Action types
type ProfileAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_USAGE_STATS'; payload: ProfileState['usageStats'] };

// Context interface
interface ProfileContextType {
  state: ProfileState;
  actions: {
    loadProfile: () => Promise<void>;
    updateProfile: (profileUpdates: Partial<UserProfile>) => Promise<void>;
    updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
    loadUsageStats: () => Promise<void>;
    exportData: () => Promise<string>;
    importData: (jsonData: string) => Promise<void>;
    clearAllData: () => Promise<void>;
    resetProfile: () => Promise<void>;
    clearError: () => void;
  };
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  usageStats: null,
};

// Reducer
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, loading: false };
    
    case 'SET_USAGE_STATS':
      return { ...state, usageStats: action.payload };
    
    default:
      return state;
  }
}

// Create context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider component
interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [state, dispatch] = useReducer(profileReducer, initialState);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
    loadUsageStats();
  }, []);

  // Actions
  const loadProfile = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const profile = await profileService.getProfile();
      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load profile' });
      console.error('Error loading profile:', error);
    }
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await profileService.updateProfile(profileUpdates);
      const updatedProfile = await profileService.getProfile();
      dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
      console.error('Error updating profile:', error);
    }
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await profileService.updatePreferences(preferences);
      const updatedProfile = await profileService.getProfile();
      dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
      console.error('Error updating preferences:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const stats = await profileService.getUsageStats();
      dispatch({ type: 'SET_USAGE_STATS', payload: stats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load usage statistics' });
      console.error('Error loading usage stats:', error);
    }
  };

  const exportData = async (): Promise<string> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const exportedData = await profileService.exportData();
      dispatch({ type: 'SET_LOADING', payload: false });
      return exportedData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to export data' });
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  const importData = async (jsonData: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await profileService.importData(jsonData);
      
      // Reload profile and stats after import
      await loadProfile();
      await loadUsageStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import data' });
      console.error('Error importing data:', error);
    }
  };

  const clearAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await profileService.clearData();
      
      // Reload profile and stats after clearing
      await loadProfile();
      await loadUsageStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear data' });
      console.error('Error clearing data:', error);
    }
  };

  const resetProfile = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await profileService.resetProfile();
      const resetProfile = await profileService.getProfile();
      dispatch({ type: 'SET_PROFILE', payload: resetProfile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset profile' });
      console.error('Error resetting profile:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: ProfileContextType = {
    state,
    actions: {
      loadProfile,
      updateProfile,
      updatePreferences,
      loadUsageStats,
      exportData,
      importData,
      clearAllData,
      resetProfile,
      clearError,
    },
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

// Hook to use profile context
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}