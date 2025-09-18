import { NextRequest, NextResponse } from 'next/server';
import { analyzePosture } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images: File[] = [];
    
    // Extract images from form data
    const entries = Array.from(formData.entries());
    for (const [key, value] of entries) {
      if (key.endsWith('Image') && value instanceof File) {
        images.push(value);
      }
    }

    if (images.length !== 4) {
      return NextResponse.json(
        { error: 'Please provide all 4 posture images' },
        { status: 400 }
      );
    }

    const result = await analyzePosture(images);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in posture analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze posture images' },
      { status: 500 }
    );
  }
}