'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthForm } from '@/components/auth/auth-form'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Editor } from '@/components/dashboard/editor'
import { UpgradeModal } from '@/components/dashboard/upgrade-modal'
import { Toaster } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [folders, setFolders] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showNewNote, setShowNewNote] = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newFolderName, setNewFolderName] = useState('')

  useEffect(() => {
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          loadProfile(session.user.id)
          loadData(session.user.id)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setUser(session?.user || null)
    if (session?.user) {
      await loadProfile(session.user.id)
      await loadData(session.user.id)
    }
    setLoading(false)
  }

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data)
  }

  const loadData = async (userId: string) => {
    // Carregar pastas
    const { data: foldersData } = await supabase
      .from('folders')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    setFolders(foldersData || [])

    // Carregar notas
    const { data: notesData } = await supabase
      .from('notes')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    setNotes(notesData || [])
  }

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      toast.error('Digite um título para a nota')
      return
    }

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: newNoteTitle,
        content: '',
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao criar nota')
      return
    }

    toast.success('Nota criada com sucesso!')
    setNotes([data, ...notes])
    setSelectedNote(data.id)
    setShowNewNote(false)
    setNewNoteTitle('')
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Digite um nome para a pasta')
      return
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({
        name: newFolderName,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      toast.error('Erro ao criar pasta')
      return
    }

    toast.success('Pasta criada com sucesso!')
    setFolders([data, ...folders])
    setShowNewFolder(false)
    setNewFolderName('')
  }

  const handleDeleteNote = async () => {
    if (!selectedNote) return

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', selectedNote)

    if (error) {
      toast.error('Erro ao deletar nota')
      return
    }

    toast.success('Nota deletada com sucesso!')
    setNotes(notes.filter((n) => n.id !== selectedNote))
    setSelectedNote(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <AuthForm />
        <Toaster position="top-center" />
      </>
    )
  }

  const currentNote = notes.find((n) => n.id === selectedNote)

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Sidebar
            user={profile}
            folders={folders}
            notes={notes}
            selectedNote={selectedNote}
            onSelectNote={setSelectedNote}
            onCreateNote={() => setShowNewNote(true)}
            onCreateFolder={() => setShowNewFolder(true)}
            onUpgrade={() => setShowUpgrade(true)}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            note={currentNote}
            user={profile}
            onUpdate={() => loadData(user.id)}
            onDelete={handleDeleteNote}
            onShare={() => toast.info('Funcionalidade de compartilhamento em breve!')}
          />
        </div>
      </div>

      {/* Modais */}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      <Dialog open={showNewNote} onOpenChange={setShowNewNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Nota</DialogTitle>
            <DialogDescription>
              Crie uma nova nota para suas anotações de RPG
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Título da Nota</Label>
              <Input
                id="note-title"
                placeholder="Ex: Sessão 1 - A Taverna Misteriosa"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
              />
            </div>
            <Button
              onClick={handleCreateNote}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Criar Nota
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pasta</DialogTitle>
            <DialogDescription>
              Organize suas notas em pastas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nome da Pasta</Label>
              <Input
                id="folder-name"
                placeholder="Ex: Campanha D&D"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            <Button
              onClick={handleCreateFolder}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Criar Pasta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </>
  )
}
