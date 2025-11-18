export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  projectId?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export type ViewMode = 'notes' | 'tasks' | 'project';
