'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/custom/Sidebar';
import NoteEditor from '@/components/custom/NoteEditor';
import TaskList from '@/components/custom/TaskList';
import { Note, Task, Project, ViewMode } from '@/lib/types';
import {
  getNotes,
  getTasks,
  getProjects,
  addNote,
  updateNote,
  deleteNote,
  addTask,
  updateTask,
  deleteTask,
  addProject,
  deleteProject,
} from '@/lib/storage';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('notes');
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    setNotes(getNotes());
    setTasks(getTasks());
    setProjects(getProjects());
  }, []);

  // Note handlers
  const handleAddNote = (note: Note) => {
    addNote(note);
    setNotes(getNotes());
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    updateNote(id, updates);
    setNotes(getNotes());
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes(getNotes());
  };

  // Task handlers
  const handleAddTask = (task: Task) => {
    addTask(task);
    setTasks(getTasks());
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
    setTasks(getTasks());
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setTasks(getTasks());
  };

  // Project handlers
  const handleAddProject = () => {
    const icons = ['📁', '🚀', '💼', '🎯', '📊', '🎨', '💡', '🔥'];
    const colors = ['blue', 'purple', 'green', 'orange', 'pink', 'red'];
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: 'Novo Projeto',
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date().toISOString(),
    };

    addProject(newProject);
    setProjects(getProjects());
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Tem certeza? Isso deletará todas as notas e tarefas deste projeto.')) {
      deleteProject(id);
      setProjects(getProjects());
      setNotes(getNotes());
      setTasks(getTasks());
      if (selectedProjectId === id) {
        setSelectedProjectId(undefined);
      }
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('notes');
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            setSelectedProjectId(undefined);
            setSidebarOpen(false);
          }}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={handleProjectSelect}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {currentView === 'notes' && (
          <NoteEditor
            notes={notes}
            selectedProjectId={selectedProjectId}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {currentView === 'tasks' && (
          <TaskList
            tasks={tasks}
            selectedProjectId={selectedProjectId}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>
    </div>
  );
}
