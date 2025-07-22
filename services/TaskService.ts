import { Task, TaskService as ITaskService, STORAGE_KEYS } from '@/types';
import { storageManager } from '@/utils/StorageManager';
import { validateTask, sanitizeStorageData, generateId } from '@/utils/dataValidation';

/**
 * TaskService implementation for managing tasks
 */
class TaskServiceImpl implements ITaskService {
  /**
   * Get all tasks
   */
  async getTasks(): Promise<Task[]> {
    try {
      const tasksData = await storageManager.getItem<Task[]>(STORAGE_KEYS.TASKS);
      if (!tasksData) {
        return [];
      }
      
      return sanitizeStorageData(tasksData, validateTask);
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task | null> {
    try {
      const tasks = await this.getTasks();
      return tasks.find(task => task.id === id) || null;
    } catch (error) {
      console.error(`Error getting task ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    try {
      const newTask: Task = {
        id: generateId(),
        createdAt: new Date(),
        ...taskData,
      };

      const tasks = await this.getTasks();
      tasks.unshift(newTask); // Add to beginning of array
      
      await storageManager.setItem(STORAGE_KEYS.TASKS, tasks);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(updatedTask: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const index = tasks.findIndex(task => task.id === updatedTask.id);
      
      if (index === -1) {
        throw new Error(`Task with id ${updatedTask.id} not found`);
      }

      tasks[index] = updatedTask;
      await storageManager.setItem(STORAGE_KEYS.TASKS, tasks);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== id);
      
      await storageManager.setItem(STORAGE_KEYS.TASKS, filteredTasks);
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string): Promise<void> {
    try {
      const task = await this.getTask(id);
      if (!task) {
        throw new Error(`Task with id ${id} not found`);
      }

      task.completed = !task.completed;
      await this.updateTask(task);
    } catch (error) {
      console.error(`Error toggling task completion ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get tasks filtered by completion status
   */
  async getTasksByStatus(completed: boolean): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(task => task.completed === completed);
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return [];
    }
  }

  /**
   * Get tasks linked to a specific chat
   */
  async getTasksByChat(chatId: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      return tasks.filter(task => task.fromChatId === chatId);
    } catch (error) {
      console.error(`Error getting tasks for chat ${chatId}:`, error);
      return [];
    }
  }

  /**
   * Search tasks by title or description
   */
  async searchTasks(query: string): Promise<Task[]> {
    try {
      const tasks = await this.getTasks();
      const lowercaseQuery = query.toLowerCase();
      
      return tasks.filter(task => 
        task.title.toLowerCase().includes(lowercaseQuery) ||
        (task.description && task.description.toLowerCase().includes(lowercaseQuery))
      );
    } catch (error) {
      console.error('Error searching tasks:', error);
      return [];
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }> {
    try {
      const tasks = await this.getTasks();
      const total = tasks.length;
      const completed = tasks.filter(task => task.completed).length;
      const pending = total - completed;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        total,
        completed,
        pending,
        completionRate: Math.round(completionRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting task stats:', error);
      return { total: 0, completed: 0, pending: 0, completionRate: 0 };
    }
  }

  /**
   * Clear all task data
   */
  async clearAllTasks(): Promise<void> {
    try {
      await storageManager.removeItem(STORAGE_KEYS.TASKS);
    } catch (error) {
      console.error('Error clearing tasks:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const taskService = new TaskServiceImpl();