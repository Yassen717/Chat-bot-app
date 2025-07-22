import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageManager } from '@/types';

/**
 * StorageManager utility for handling AsyncStorage operations
 * Provides type-safe CRUD operations with error handling
 */
class AsyncStorageManager implements StorageManager {
  /**
   * Get an item from AsyncStorage
   * @param key Storage key
   * @returns Parsed item or null if not found
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set an item in AsyncStorage
   * @param key Storage key
   * @param value Value to store
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove an item from AsyncStorage
   * @param key Storage key
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all items from AsyncStorage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Get multiple items from AsyncStorage
   * @param keys Array of storage keys
   * @returns Object with key-value pairs
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const items = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};
      
      items.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) as T : null;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  /**
   * Set multiple items in AsyncStorage
   * @param items Array of [key, value] pairs
   */
  async setMultiple<T>(items: Array<[string, T]>): Promise<void> {
    try {
      const jsonItems: Array<[string, string]> = items.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(jsonItems);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storageManager = new AsyncStorageManager();