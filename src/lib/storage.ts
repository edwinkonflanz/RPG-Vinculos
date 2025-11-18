import { Note, Task, Project } from './types';

const STORAGE_KEYS = {
  NOTES: 'notion-clone-notes',
  TASKS: 'notion-clone-tasks',
  PROJECTS: 'notion-clone-projects',
  SHARED_NOTES: 'notion-clone-shared-notes',
};

// Notes
export const getNotes = (): Note[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.NOTES);
  return data ? JSON.parse(data) : [];
};

export const saveNotes = (notes: Note[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
};

export const addNote = (note: Note): void => {
  const notes = getNotes();
  notes.unshift(note);
  saveNotes(notes);
};

export const updateNote = (id: string, updates: Partial<Note>): void => {
  const notes = getNotes();
  const index = notes.findIndex(n => n.id === id);
  if (index !== -1) {
    notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() };
    saveNotes(notes);
  }
};

export const deleteNote = (id: string): void => {
  const notes = getNotes().filter(n => n.id !== id);
  saveNotes(notes);
};

// Tasks
export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const addTask = (task: Task): void => {
  const tasks = getTasks();
  tasks.unshift(task);
  saveTasks(tasks);
};

export const updateTask = (id: string, updates: Partial<Task>): void => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    saveTasks(tasks);
  }
};

export const deleteTask = (id: string): void => {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
};

// Projects
export const getProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveProjects = (projects: Project[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const addProject = (project: Project): void => {
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
};

export const deleteProject = (id: string): void => {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
  
  // Remove notes and tasks associated with this project
  const notes = getNotes().filter(n => n.projectId !== id);
  saveNotes(notes);
  
  const tasks = getTasks().filter(t => t.projectId !== id);
  saveTasks(tasks);
};

// Shared Notes (localStorage-based)
export interface SharedNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const getSharedNotes = (): Record<string, SharedNote> => {
  if (typeof window === 'undefined') return {};
  const data = localStorage.getItem(STORAGE_KEYS.SHARED_NOTES);
  return data ? JSON.parse(data) : {};
};

export const saveSharedNotes = (notes: Record<string, SharedNote>): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SHARED_NOTES, JSON.stringify(notes));
};

export const getSharedNote = (id: string): SharedNote | null => {
  const notes = getSharedNotes();
  return notes[id] || null;
};

export const createSharedNote = (title: string, content: string): SharedNote => {
  const id = generateShareId();
  const note: SharedNote = {
    id,
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const notes = getSharedNotes();
  notes[id] = note;
  saveSharedNotes(notes);
  
  return note;
};

export const updateSharedNote = (id: string, title: string, content: string): SharedNote | null => {
  const notes = getSharedNotes();
  if (!notes[id]) return null;
  
  notes[id] = {
    ...notes[id],
    title,
    content,
    updatedAt: new Date().toISOString(),
  };
  
  saveSharedNotes(notes);
  return notes[id];
};

export const deleteSharedNote = (id: string): void => {
  const notes = getSharedNotes();
  delete notes[id];
  saveSharedNotes(notes);
};

// Generate unique share ID
function generateShareId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}
