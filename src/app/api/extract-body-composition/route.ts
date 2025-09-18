import { NextRequest, NextResponse } from 'next/server';
import { extractBodyCompositionData } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Starting body composition extraction');
    
    const formData = await request.formData();
    const reportImage = formData.get('reportImage') as File;

    console.log('API: Report image received:', {
      name: reportImage?.name,
      size: reportImage?.size,
      type: reportImage?.type
    });

    if (!reportImage) {
      console.log('API: No report image provided');
      return NextResponse.json(
        { error: 'Please provide a body composition report image' },
        { status: 400 }
      );
    }

    console.log('API: Calling extractBodyCompositionData');
    const extractedData = await extractBodyCompositionData(reportImage);
    console.log('API: Extraction successful, data:', extractedData);
    
    return NextResponse.json({
      success: true,
      data: extractedData
    });
  } catch (error: any) {
    console.error('Error in body composition extraction API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        error: 'Failed to extract data from body composition report',
        details: error.message 
      },
      { status: 500 }
    );
  }
}