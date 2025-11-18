'use client';

import { useState } from 'react';
import { Task, Priority } from '@/lib/types';
import { CheckSquare, Plus, Trash2, Calendar, Flag } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  selectedProjectId?: string;
  onAddTask: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

const priorityColors = {
  low: 'text-green-600 bg-green-50 dark:bg-green-950',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
  high: 'text-red-600 bg-red-50 dark:bg-red-950',
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export default function TaskList({
  tasks,
  selectedProjectId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.projectId === selectedProjectId)
    : tasks;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      projectId: selectedProjectId,
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskPriority('medium');
    setShowAddTask(false);
  };

  const toggleTask = (task: Task) => {
    onUpdateTask(task.id, { completed: !task.completed });
  };

  const incompleteTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Tarefas</h2>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e prioridades
          </p>
        </div>

        {/* Add Task Button */}
        {!showAddTask && (
          <button
            onClick={() => setShowAddTask(true)}
            className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Adicionar nova tarefa</span>
          </button>
        )}

        {/* Add Task Form */}
        {showAddTask && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Título da tarefa"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg mb-3 outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Prioridade
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  Data de vencimento
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setNewTaskTitle('');
                  setNewTaskDueDate('');
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Incomplete Tasks */}
        {incompleteTasks.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              A Fazer ({incompleteTasks.length})
            </h3>
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Concluídas ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl font-medium text-muted-foreground">
              Nenhuma tarefa ainda
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Adicione sua primeira tarefa para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div
      className={`group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            task.completed
              ? 'bg-primary border-primary'
              : 'border-muted-foreground hover:border-primary'
          }`}
        >
          {task.completed && (
            <svg
              className="w-3 h-3 text-primary-foreground"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-medium ${
              task.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {task.title}
          </h4>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                priorityColors[task.priority]
              }`}
            >
              <Flag className="w-3 h-3" />
              {priorityLabels[task.priority]}
            </span>

            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isOverdue
                    ? 'text-red-600 bg-red-50 dark:bg-red-950'
                    : 'text-blue-600 bg-blue-50 dark:bg-blue-950'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded transition-all flex-shrink-0"
          title="Deletar tarefa"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}
