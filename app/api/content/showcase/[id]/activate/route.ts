import { NextResponse } from 'next/server';
import { activateShowcaseSectionFromDB } from '@/db/queries/content';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const result = await activateShowcaseSectionFromDB(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Showcase content not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error activating showcase content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}