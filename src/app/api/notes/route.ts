import { NextRequest, NextResponse } from 'next/server';
import { createSharedNote } from '@/lib/storage';

// POST - Criar nova nota compartilhada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;

    const newNote = createSharedNote(
      title || 'Nova Nota Compartilhada',
      content || ''
    );

    return NextResponse.json(newNote);
  } catch (error) {
    console.error('[API] Erro no POST:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao criar nota compartilhada',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
