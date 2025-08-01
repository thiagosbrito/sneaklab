import { NextResponse } from 'next/server';
import { 
  getActiveShowcaseSectionFromDB, 
  getAllShowcaseSectionsFromDB,
  createShowcaseSectionFromDB,
  updateShowcaseSectionFromDB,
  activateShowcaseSectionFromDB
} from '@/db/queries/content';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    if (showAll) {
      // Return all versions for CMS management
      const content = await getAllShowcaseSectionsFromDB();
      return NextResponse.json(content);
    } else {
      // Return only active content for public display
      const content = await getActiveShowcaseSectionFromDB();
      
      if (!content) {
        return NextResponse.json({ error: 'No active showcase content found' }, { status: 404 });
      }

      return NextResponse.json(content);
    }
  } catch (error) {
    console.error('Error fetching showcase content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'imageUrl', 'subtitleA', 'subtitleB', 'subtitleDescriptionA', 'subtitleDescriptionB'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new version (defaults to inactive unless specified)
    const result = await createShowcaseSectionFromDB({
      ...body,
      isActive: body.isActive || false
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating showcase content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const result = await updateShowcaseSectionFromDB(id, updateData);
    
    if (!result) {
      return NextResponse.json({ error: 'Showcase content not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating showcase content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}