'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { FileText, Save, Trash2, Plus, Share2, Copy, Check } from 'lucide-react';

interface NoteEditorProps {
  notes: Note[];
  selectedProjectId?: string;
  onAddNote: (note: Note) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export default function NoteEditor({
  notes,
  selectedProjectId,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: NoteEditorProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const filteredNotes = selectedProjectId
    ? notes.filter(n => n.projectId === selectedProjectId)
    : notes;

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    }
  }, [selectedNote]);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Nota',
      content: '',
      projectId: selectedProjectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddNote(newNote);
    setSelectedNote(newNote);
  };

  const handleSave = () => {
    if (selectedNote) {
      onUpdateNote(selectedNote.id, { title, content });
    }
  };

  const handleDelete = () => {
    if (selectedNote && confirm('Tem certeza que deseja deletar esta nota?')) {
      onDeleteNote(selectedNote.id);
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
  };

  const handleShare = async () => {
    if (!selectedNote) return;

    setIsSharing(true);
    try {
      // Criar nota compartilhada via API
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedNote.title,
          content: selectedNote.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar nota compartilhada');
      }

      const data = await response.json();
      const link = `${window.location.origin}/shared/${data.id}`;
      setShareLink(link);
      setShowShareDialog(true);
    } catch (error) {
      alert('Erro ao compartilhar nota. Tente novamente.');
      console.error('[Share] Erro:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Notes List */}
      <div className="w-full md:w-80 border-r border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <h2 className="font-semibold text-lg">Minhas Notas</h2>
          <button
            onClick={handleCreateNote}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            title="Nova nota"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-2 space-y-1">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedNote?.id === note.id
                  ? 'bg-accent border-l-4 border-primary'
                  : 'hover:bg-accent/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{note.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {note.content || 'Sem conteúdo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 px-4">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma nota ainda</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique no + para criar sua primeira nota
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedNote ? (
          <>
            <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 w-full text-xl sm:text-2xl font-bold bg-transparent border-none outline-none"
                placeholder="Título da nota"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Compartilhar nota"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  title="Salvar"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                  title="Deletar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none resize-none text-base leading-relaxed"
                placeholder="Comece a escrever..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-xl font-medium text-muted-foreground">
                Selecione uma nota
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ou crie uma nova para começar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600/10 rounded-lg">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Nota Compartilhada!</h3>
                <p className="text-sm text-muted-foreground">
                  Qualquer pessoa com o link pode editar
                </p>
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-3 mb-4 break-all text-sm">
              {shareLink}
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-600">
                💡 <strong>Dica:</strong> As alterações são sincronizadas automaticamente entre todos que acessarem o link!
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Link
                  </>
                )}
              </button>
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
