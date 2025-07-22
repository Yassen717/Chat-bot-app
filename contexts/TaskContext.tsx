import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task } from '@/types';
import { taskService } from '@/services';

// State interface
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'completed' | 'pending';
}

// Action types
type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: 'all' | 'completed' | 'pending' };

// Context interface
interface TaskContextType {
  state: TaskState;
  actions: {
    loadTasks: () => Promise<void>;
    createTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    toggleTaskCompletion: (taskId: string) => Promise<void>;
    searchTasks: (query: string) => Promise<Task[]>;
    getTasksByChat: (chatId: string) => Promise<Task[]>;
    getTaskStats: () => Promise<{
      total: number;
      completed: number;
      pending: number;
      completionRate: number;
    }>;
    setFilter: (filter: 'all' | 'completed' | 'pending') => void;
    clearError: () => void;
  };
  filteredTasks: Task[];
}

// Initial state
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  filter: 'all',
};

// Reducer
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    default:
      return state;
  }
}

// Create context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Compute filtered tasks
  const filteredTasks = React.useMemo(() => {
    switch (state.filter) {
      case 'completed':
        return state.tasks.filter(task => task.completed);
      case 'pending':
        return state.tasks.filter(task => !task.completed);
      default:
        return state.tasks;
    }
  }, [state.tasks, state.filter]);

  // Actions
  const loadTasks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tasks = await taskService.getTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load tasks' });
      console.error('Error loading tasks:', error);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newTask = await taskService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: newTask });
      return newTask;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const updateTask = async (task: Task) => {
    try {
      await taskService.updateTask(task);
      dispatch({ type: 'UPDATE_TASK', payload: task });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
      console.error('Error deleting task:', error);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      await taskService.toggleTaskCompletion(taskId);
      const updatedTask = await taskService.getTask(taskId);
      if (updatedTask) {
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle task completion' });
      console.error('Error toggling task completion:', error);
    }
  };

  const searchTasks = async (query: string): Promise<Task[]> => {
    try {
      return await taskService.searchTasks(query);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search tasks' });
      console.error('Error searching tasks:', error);
      return [];
    }
  };

  const getTasksByChat = async (chatId: string): Promise<Task[]> => {
    try {
      return await taskService.getTasksByChat(chatId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get tasks by chat' });
      console.error('Error getting tasks by chat:', error);
      return [];
    }
  };

  const getTaskStats = async () => {
    try {
      return await taskService.getTaskStats();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get task statistics' });
      console.error('Error getting task stats:', error);
      return { total: 0, completed: 0, pending: 0, completionRate: 0 };
    }
  };

  const setFilter = (filter: 'all' | 'completed' | 'pending') => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: TaskContextType = {
    state,
    filteredTasks,
    actions: {
      loadTasks,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      searchTasks,
      getTasksByChat,
      getTaskStats,
      setFilter,
      clearError,
    },
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

// Hook to use task context
export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}