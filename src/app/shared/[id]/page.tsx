'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Users, Wifi, WifiOff, Save, AlertCircle } from 'lucide-react';

interface SharedNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function SharedNotePage() {
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<SharedNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsers, setActiveUsers] = useState(1);
  const [isConnected, setIsConnected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState('');
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromRemote = useRef(false);
  const broadcastChannel = useRef<BroadcastChannel | null>(null);
  const lastKnownUpdatedAt = useRef<string>('');

  // Carregar nota inicial
  useEffect(() => {
    loadNote();
  }, [noteId]);

  // Configurar sincronização via BroadcastChannel (entre abas) + polling (entre dispositivos)
  useEffect(() => {
    if (!note) return;

    console.log('[Sync] Configurando sincronização para nota:', noteId);

    // BroadcastChannel para sincronização entre abas do mesmo navegador
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(`shared-note-${noteId}`);
      
      channel.onmessage = (event) => {
        console.log('[BroadcastChannel] Atualização recebida:', event.data);
        const updatedNote = event.data as SharedNote;
        
        // Só atualiza se for uma versão mais recente
        if (updatedNote.updatedAt !== lastKnownUpdatedAt.current) {
          isUpdatingFromRemote.current = true;
          setNote(updatedNote);
          setTitle(updatedNote.title);
          setContent(updatedNote.content);
          setLastSyncTime(new Date());
          setSyncError('');
          lastKnownUpdatedAt.current = updatedNote.updatedAt;
          
          setTimeout(() => {
            isUpdatingFromRemote.current = false;
          }, 100);
        }
      };

      broadcastChannel.current = channel;
      setIsConnected(true);
    }

    // Polling para sincronização entre dispositivos diferentes (a cada 2 segundos)
    const startPolling = () => {
      pollingIntervalRef.current = setInterval(async () => {
        console.log('[Polling] Buscando atualizações...');
        try {
          const response = await fetch(`/api/notes/${noteId}`, {
            cache: 'no-store',
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Só atualiza se o conteúdo mudou e não estamos salvando
            if (data.updatedAt !== lastKnownUpdatedAt.current && !isSaving) {
              console.log('[Polling] Nova versão detectada:', data.updatedAt);
              isUpdatingFromRemote.current = true;
              setNote(data);
              setTitle(data.title);
              setContent(data.content);
              setLastSyncTime(new Date());
              setSyncError('');
              lastKnownUpdatedAt.current = data.updatedAt;
              
              setTimeout(() => {
                isUpdatingFromRemote.current = false;
              }, 100);
            }
          }
        } catch (err) {
          console.error('[Polling] Erro:', err);
          setIsConnected(false);
        }
      }, 2000);
    };

    startPolling();

    // Simular contagem de usuários ativos (entre 1-3 para demonstração)
    const userCountInterval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 3) + 1);
    }, 5000);

    return () => {
      console.log('[Sync] Limpando subscrições');
      if (broadcastChannel.current) {
        broadcastChannel.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      clearInterval(userCountInterval);
    };
  }, [note, noteId, isSaving]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[Load] Carregando nota:', noteId);
      
      const response = await fetch(`/api/notes/${noteId}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nota não encontrada');
      }

      const data = await response.json();
      console.log('[Load] Nota carregada:', data);
      setNote(data);
      setTitle(data.title);
      setContent(data.content);
      setLastSyncTime(new Date());
      lastKnownUpdatedAt.current = data.updatedAt;
      setIsConnected(true);
    } catch (err) {
      console.error('[Load] Erro ao carregar nota:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar nota');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = useCallback(async () => {
    if (!note || isSaving || isUpdatingFromRemote.current) return;

    setIsSaving(true);
    setSyncError('');
    console.log('[Save] Salvando nota:', { title, content: content.substring(0, 50) });

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar');
      }

      const updatedNote = await response.json();
      console.log('[Save] Nota salva com sucesso:', updatedNote.updatedAt);
      setNote(updatedNote);
      setLastSyncTime(new Date());
      lastKnownUpdatedAt.current = updatedNote.updatedAt;
      setIsConnected(true);

      // Notificar outras abas via BroadcastChannel
      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage(updatedNote);
      }
    } catch (err) {
      console.error('[Save] Erro ao salvar nota:', err);
      setSyncError(err instanceof Error ? err.message : 'Erro ao salvar nota');
      setIsConnected(false);
    } finally {
      setIsSaving(false);
    }
  }, [note, noteId, title, content, isSaving]);

  // Auto-save com debounce de 1.5 segundos
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (note && !isUpdatingFromRemote.current && (title !== note.title || content !== note.content)) {
      saveTimeoutRef.current = setTimeout(() => {
        saveNote();
      }, 1500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, note, saveNote]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando nota...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md p-8">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Nota não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'Esta nota pode ter sido deletada ou o link está incorreto.'}
          </p>
          {error && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 mb-4 text-sm text-red-600">
              <strong>Erro:</strong> {error}
            </div>
          )}
          <a
            href="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Voltar para início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Nota Compartilhada</h1>
                <p className="text-sm text-muted-foreground">
                  Edição colaborativa em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status de conexão */}
              <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-green-600">
                      Conectado
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-orange-600" />
                    <span className="text-xs sm:text-sm font-medium text-orange-600">
                      Offline
                    </span>
                  </>
                )}
              </div>

              {/* Usuários ativos */}
              <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">
                  {activeUsers} {activeUsers === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>

              {/* Indicador de salvamento */}
              {isSaving && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground px-3 py-2 bg-accent rounded-lg">
                  <Save className="w-4 h-4 animate-pulse" />
                  Salvando...
                </div>
              )}

              {/* Última sincronização */}
              {lastSyncTime && !isSaving && (
                <div className="text-xs text-muted-foreground px-3 py-2 bg-accent rounded-lg">
                  Sincronizado {lastSyncTime.toLocaleTimeString('pt-BR')}
                </div>
              )}
            </div>
          </div>

          {/* Aviso de colaboração */}
          {activeUsers > 1 && (
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3">
              <p className="text-sm text-blue-600 font-medium">
                🎉 {activeUsers - 1} {activeUsers === 2 ? 'pessoa está' : 'pessoas estão'} editando esta nota agora!
              </p>
            </div>
          )}

          {/* Erro de sincronização */}
          {syncError && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 flex items-start gap-2 mt-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-600 font-medium">Erro de sincronização</p>
                <p className="text-xs text-red-600/80 mt-1">{syncError}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto h-full flex flex-col p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl sm:text-4xl font-bold bg-transparent border-none outline-none mb-6 placeholder:text-muted-foreground/50"
            placeholder="Título da nota"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none resize-none text-base sm:text-lg leading-relaxed placeholder:text-muted-foreground/50"
            placeholder="Comece a escrever... Suas alterações são salvas automaticamente."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card py-3">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            💡 Dica: Suas alterações são sincronizadas automaticamente entre todas as abas e dispositivos
          </p>
        </div>
      </div>
    </div>
  );
}
