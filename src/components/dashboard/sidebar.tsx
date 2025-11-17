'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  FolderPlus,
  FilePlus,
  Folder,
  FileText,
  Crown,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface SidebarProps {
  user: any
  folders: any[]
  notes: any[]
  selectedNote: string | null
  onSelectNote: (noteId: string) => void
  onCreateNote: () => void
  onCreateFolder: () => void
  onUpgrade: () => void
}

export function Sidebar({
  user,
  folders,
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onCreateFolder,
  onUpgrade,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Logout realizado com sucesso!')
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const isPremium = user?.plan === 'premium'

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            RPG Notes
          </h2>
          {isPremium && (
            <Crown className="h-5 w-5 text-yellow-500" />
          )}
        </div>

        {!isPremium && (
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            size="sm"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Premium
          </Button>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onCreateNote}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Nova Nota
          </Button>
          <Button
            onClick={onCreateFolder}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Pasta
          </Button>
        </div>
      </div>

      <Separator />

      {/* Notes List */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {/* Notas sem pasta */}
          {notes
            .filter((note) => !note.folder_id)
            .map((note) => (
              <Button
                key={note.id}
                variant={selectedNote === note.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onSelectNote(note.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate">{note.title}</span>
              </Button>
            ))}

          {/* Pastas */}
          {folders.map((folder) => (
            <div key={folder.id}>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => toggleFolder(folder.id)}
              >
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronRight className="mr-2 h-4 w-4" />
                )}
                <Folder className="mr-2 h-4 w-4" />
                <span className="truncate">{folder.name}</span>
              </Button>

              {expandedFolders.has(folder.id) && (
                <div className="ml-6 space-y-1">
                  {notes
                    .filter((note) => note.folder_id === folder.id)
                    .map((note) => (
                      <Button
                        key={note.id}
                        variant={selectedNote === note.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => onSelectNote(note.id)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        <span className="truncate">{note.title}</span>
                      </Button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white dark:bg-gray-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground">
              {isPremium ? 'Premium' : 'Plano Gratuito'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
