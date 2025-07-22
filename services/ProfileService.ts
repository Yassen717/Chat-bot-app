import { UserProfile, ProfileService as IProfileService, STORAGE_KEYS } from '@/types';
import { storageManager } from '@/utils/StorageManager';
import { validateUserProfile, createDefaultUserProfile } from '@/utils/dataValidation';
import { chatService } from './ChatService';
import { taskService } from './TaskService';

/**
 * ProfileService implementation for managing user profile and settings
 */
class ProfileServiceImpl implements IProfileService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const profileData = await storageManager.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      
      if (!profileData || !validateUserProfile(profileData)) {
        // Return default profile if none exists or invalid
        const defaultProfile = createDefaultUserProfile();
        await this.updateProfile(defaultProfile);
        return defaultProfile;
      }
      
      return profileData;
    } catch (error) {
      console.error('Error getting profile:', error);
      return createDefaultUserProfile();
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileUpdates: Partial<UserProfile>): Promise<void> {
    try {
      const currentProfile = await this.getProfile();
      
      // Merge updates with current profile
      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...profileUpdates,
        preferences: {
          ...currentProfile.preferences,
          ...(profileUpdates.preferences || {}),
        },
      };

      // Validate updated profile
      if (!validateUserProfile(updatedProfile)) {
        throw new Error('Invalid profile data');
      }

      await storageManager.setItem(STORAGE_KEYS.USER_PROFILE, updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      const currentProfile = await this.getProfile();
      
      await this.updateProfile({
        preferences: {
          ...currentProfile.preferences,
          ...preferences,
        },
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Clear all user data (chats, tasks, profile)
   */
  async clearData(): Promise<void> {
    try {
      await Promise.all([
        chatService.clearAllChats(),
        taskService.clearAllTasks(),
        storageManager.removeItem(STORAGE_KEYS.USER_PROFILE),
        storageManager.removeItem(STORAGE_KEYS.APP_SETTINGS),
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * Export all user data as JSON string
   */
  async exportData(): Promise<string> {
    try {
      const [chats, tasks, profile] = await Promise.all([
        chatService.getChats(),
        taskService.getTasks(),
        this.getProfile(),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data: {
          chats,
          tasks,
          profile,
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import data from JSON string
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.data) {
        throw new Error('Invalid import data format');
      }

      const { chats, tasks, profile } = importData.data;

      // Import data with validation
      if (chats && Array.isArray(chats)) {
        await storageManager.setItem(STORAGE_KEYS.CHATS, chats);
      }

      if (tasks && Array.isArray(tasks)) {
        await storageManager.setItem(STORAGE_KEYS.TASKS, tasks);
      }

      if (profile && validateUserProfile(profile)) {
        await storageManager.setItem(STORAGE_KEYS.USER_PROFILE, profile);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Get app usage statistics
   */
  async getUsageStats(): Promise<{
    totalChats: number;
    totalMessages: number;
    totalTasks: number;
    completedTasks: number;
    storageUsed: string;
  }> {
    try {
      const [chats, taskStats] = await Promise.all([
        chatService.getChats(),
        taskService.getTaskStats(),
      ]);

      const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
      
      // Estimate storage usage (rough calculation)
      const dataSize = JSON.stringify({ chats, tasks: await taskService.getTasks() }).length;
      const storageUsed = `${Math.round(dataSize / 1024)} KB`;

      return {
        totalChats: chats.length,
        totalMessages,
        totalTasks: taskStats.total,
        completedTasks: taskStats.completed,
        storageUsed,
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        totalChats: 0,
        totalMessages: 0,
        totalTasks: 0,
        completedTasks: 0,
        storageUsed: '0 KB',
      };
    }
  }

  /**
   * Reset profile to defaults
   */
  async resetProfile(): Promise<void> {
    try {
      const defaultProfile = createDefaultUserProfile();
      await storageManager.setItem(STORAGE_KEYS.USER_PROFILE, defaultProfile);
    } catch (error) {
      console.error('Error resetting profile:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileServiceImpl();