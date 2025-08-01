import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aboutUsSection } from '@/db/schema';

export async function GET() {
  try {
    const content = await db.select().from(aboutUsSection).limit(1);
    
    if (content.length === 0) {
      return NextResponse.json({ error: 'About us content not found' }, { status: 404 });
    }

    return NextResponse.json(content[0]);
  } catch (error) {
    console.error('Error fetching about us content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}