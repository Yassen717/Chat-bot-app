import { chatService } from '../ChatService';
import { taskService } from '../TaskService';
import { profileService } from '../ProfileService';

/**
 * Basic tests for storage services
 * These tests verify the core functionality of our services
 */

describe('Storage Services', () => {
  beforeEach(async () => {
    // Clear all data before each test
    await chatService.clearAllChats();
    await taskService.clearAllTasks();
    await profileService.clearData();
  });

  describe('ChatService', () => {
    it('should create and retrieve chats', async () => {
      const chat = await chatService.createChat('Test Chat');
      expect(chat.title).toBe('Test Chat');
      expect(chat.id).toBeDefined();
      expect(chat.messages).toEqual([]);

      const retrievedChat = await chatService.getChat(chat.id);
      expect(retrievedChat).toEqual(chat);
    });

    it('should add messages to chats', async () => {
      const chat = await chatService.createChat('Test Chat');
      const message = await chatService.addMessage(chat.id, {
        text: 'Hello, world!',
        isUser: true,
        timestamp: new Date(),
      });

      expect(message.text).toBe('Hello, world!');
      expect(message.isUser).toBe(true);
      expect(message.chatId).toBe(chat.id);

      const updatedChat = await chatService.getChat(chat.id);
      expect(updatedChat?.messages).toHaveLength(1);
      expect(updatedChat?.lastMessage).toBe('Hello, world!');
    });

    it('should delete chats', async () => {
      const chat = await chatService.createChat('Test Chat');
      await chatService.deleteChat(chat.id);

      const retrievedChat = await chatService.getChat(chat.id);
      expect(retrievedChat).toBeNull();
    });
  });

  describe('TaskService', () => {
    it('should create and retrieve tasks', async () => {
      const task = await taskService.createTask({
        title: 'Test Task',
        description: 'This is a test task',
        completed: false,
      });

      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('This is a test task');
      expect(task.completed).toBe(false);
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);

      const retrievedTask = await taskService.getTask(task.id);
      expect(retrievedTask).toEqual(task);
    });

    it('should toggle task completion', async () => {
      const task = await taskService.createTask({
        title: 'Test Task',
        completed: false,
      });

      await taskService.toggleTaskCompletion(task.id);
      const updatedTask = await taskService.getTask(task.id);
      expect(updatedTask?.completed).toBe(true);

      await taskService.toggleTaskCompletion(task.id);
      const toggledTask = await taskService.getTask(task.id);
      expect(toggledTask?.completed).toBe(false);
    });

    it('should get task statistics', async () => {
      await taskService.createTask({ title: 'Task 1', completed: false });
      await taskService.createTask({ title: 'Task 2', completed: true });
      await taskService.createTask({ title: 'Task 3', completed: true });

      const stats = await taskService.getTaskStats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.completionRate).toBe(66.67);
    });
  });

  describe('ProfileService', () => {
    it('should create default profile', async () => {
      const profile = await profileService.getProfile();
      expect(profile.preferences.theme).toBe('auto');
      expect(profile.preferences.notifications).toBe(true);
      expect(profile.preferences.aiModel).toBe('gpt-3.5-turbo');
    });

    it('should update profile', async () => {
      await profileService.updateProfile({
        name: 'Test User',
        preferences: {
          theme: 'dark',
          notifications: false,
          aiModel: 'gpt-4',
        },
      });

      const profile = await profileService.getProfile();
      expect(profile.name).toBe('Test User');
      expect(profile.preferences.theme).toBe('dark');
      expect(profile.preferences.notifications).toBe(false);
      expect(profile.preferences.aiModel).toBe('gpt-4');
    });

    it('should export and import data', async () => {
      // Create some test data
      const chat = await chatService.createChat('Test Chat');
      await chatService.addMessage(chat.id, {
        text: 'Test message',
        isUser: true,
        timestamp: new Date(),
      });

      await taskService.createTask({
        title: 'Test Task',
        completed: false,
      });

      await profileService.updateProfile({
        name: 'Test User',
      });

      // Export data
      const exportedData = await profileService.exportData();
      expect(exportedData).toBeDefined();

      // Clear data
      await profileService.clearData();

      // Verify data is cleared
      const chats = await chatService.getChats();
      const tasks = await taskService.getTasks();
      expect(chats).toHaveLength(0);
      expect(tasks).toHaveLength(0);

      // Import data
      await profileService.importData(exportedData);

      // Verify data is restored
      const restoredChats = await chatService.getChats();
      const restoredTasks = await taskService.getTasks();
      expect(restoredChats).toHaveLength(1);
      expect(restoredTasks).toHaveLength(1);
    });
  });
});