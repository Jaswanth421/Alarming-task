export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string; // ISO string
  alarmTime?: string; // ISO string
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  color: string;
}

export type AuthMode = 'login' | 'signup';
export type AppView = 'dashboard' | 'tasks' | 'notes';
