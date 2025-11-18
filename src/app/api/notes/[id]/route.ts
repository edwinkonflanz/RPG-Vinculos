import { NextRequest, NextResponse } from 'next/server';
import { getSharedNote, updateSharedNote, deleteSharedNote } from '@/lib/storage';

// GET - Buscar nota compartilhada
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = getSharedNote(params.id);

    if (!note) {
      return NextResponse.json(
        { error: 'Nota não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('[API] Erro no GET:', error);
    return NextResponse.json(
      { 
        error: 'Nota não encontrada',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 404 }
    );
  }
}

// PUT - Atualizar nota compartilhada
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content } = body;

    const updatedNote = updateSharedNote(params.id, title, content);

    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Nota não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('[API] Erro no PUT:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao atualizar nota',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Deletar nota compartilhada
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    deleteSharedNote(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Erro no DELETE:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao deletar nota',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
