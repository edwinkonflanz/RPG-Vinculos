'use client';

import { FileText, CheckSquare, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { Project, ViewMode } from '@/lib/types';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  projects: Project[];
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  onAddProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  projects,
  selectedProjectId,
  onProjectSelect,
  onAddProject,
  onDeleteProject,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          NotionFlow
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Organize sua vida</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          onClick={() => onViewChange('notes')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            currentView === 'notes'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-accent text-foreground'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Notas</span>
        </button>

        <button
          onClick={() => onViewChange('tasks')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            currentView === 'tasks'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-accent text-foreground'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="font-medium">Tarefas</span>
        </button>

        {/* Projects Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Projetos
            </span>
            <button
              onClick={onAddProject}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Adicionar projeto"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 mt-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  selectedProjectId === project.id
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => onProjectSelect(project.id)}
              >
                <span className="text-lg">{project.icon}</span>
                <span className="flex-1 text-sm font-medium truncate">
                  {project.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                  title="Deletar projeto"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}

            {projects.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-2">
                Nenhum projeto ainda
              </p>
            )}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Feito com 💜 por você
        </p>
      </div>
    </aside>
  );
}
