'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Share2,
  Users,
  Trash2,
  Download,
  Crown,
  FileText,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface EditorProps {
  note: any
  user: any
  onUpdate: () => void
  onDelete: () => void
  onShare: () => void
}

export function Editor({ note, user, onUpdate, onDelete, onShare }: EditorProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [saving, setSaving] = useState(false)
  const [collaborators, setCollaborators] = useState<any[]>([])

  const isPremium = user?.plan === 'premium'
  const isOwner = note?.owner_id === user?.id

  useEffect(() => {
    setTitle(note?.title || '')
    setContent(note?.content || '')
    loadCollaborators()
  }, [note?.id])

  const loadCollaborators = async () => {
    if (!note?.id) return

    const { data } = await supabase
      .from('collaborators')
      .select('*, users(full_name, email)')
      .eq('note_id', note.id)

    setCollaborators(data || [])
  }

  const handleSave = async () => {
    if (!note?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', note.id)

      if (error) throw error

      toast.success('Nota salva com sucesso!')
      onUpdate()
    } catch (error: any) {
      toast.error('Erro ao salvar nota')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    if (!isPremium) {
      toast.error('Exportação disponível apenas no plano Premium')
      return
    }

    const blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.md`
    a.click()
    toast.success('Nota exportada com sucesso!')
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto opacity-20" />
          <p>Selecione uma nota ou crie uma nova</p>
        </div>
      </div>
    )
  }

  const maxCollaborators = isPremium ? Infinity : 6
  const canAddCollaborators = collaborators.length < maxCollaborators

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>

          {isOwner && (
            <>
              <Button
                onClick={onShare}
                variant="outline"
                size="sm"
                disabled={!canAddCollaborators && !isPremium}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartilhar
                {!isPremium && (
                  <Badge variant="secondary" className="ml-2">
                    {collaborators.length}/{maxCollaborators}
                  </Badge>
                )}
              </Button>

              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
                {!isPremium && <Crown className="ml-2 h-3 w-3 text-yellow-500" />}
              </Button>

              <Button
                onClick={onDelete}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {collaborators.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {collaborators.length} colaborador(es)
            </span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da nota..."
          className="text-3xl font-bold border-none focus-visible:ring-0 px-0"
        />

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comece a escrever suas anotações de RPG..."
          className="min-h-[500px] border-none focus-visible:ring-0 resize-none text-lg px-0"
        />
      </div>
    </div>
  )
}
