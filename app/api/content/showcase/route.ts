import { NextResponse } from 'next/server';
import { db } from '@/db';
import { showcaseSection } from '@/db/schema';

export async function GET() {
  try {
    const content = await db.select().from(showcaseSection).limit(1);
    
    if (content.length === 0) {
      return NextResponse.json({ error: 'Showcase content not found' }, { status: 404 });
    }

    return NextResponse.json(content[0]);
  } catch (error) {
    console.error('Error fetching showcase content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}