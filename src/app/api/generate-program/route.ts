import { NextRequest, NextResponse } from 'next/server';
import { generatePilatesProgram } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Pilates program generation...');

    const body = await request.json();
    const { postureAnalysis, recommendations, healthAssessment, userGoals, selectedEquipment } = body;

    console.log('API: Received data:', {
      hasPostureAnalysis: !!postureAnalysis,
      postureAnalysisLength: postureAnalysis?.length,
      hasRecommendations: !!recommendations,
      recommendationsCount: recommendations?.length,
      hasHealthAssessment: !!healthAssessment,
      hasUserGoals: !!userGoals,
      userGoalType: userGoals?.primaryGoal,
      selectedEquipment: selectedEquipment
    });

    if (!postureAnalysis) {
      console.log('ERROR: Missing posture analysis data');
      return NextResponse.json(
        { error: 'Posture analysis is required' },
        { status: 400 }
      );
    }

    if (!selectedEquipment || selectedEquipment.length === 0) {
      console.log('ERROR: No equipment selected');
      return NextResponse.json(
        { error: 'Equipment selection is required' },
        { status: 400 }
      );
    }

    const result = await generatePilatesProgram({
      postureAnalysis,
      recommendations,
      healthAssessment,
      userGoals,
      selectedEquipment
    });

    console.log('Program generated successfully:', {
      title: result.title,
      duration: result.duration,
      warmUpCount: result.warmUp?.length || 0,
      mainWorkoutCount: result.mainWorkout?.length || 0,
      coolDownCount: result.coolDown?.length || 0,
      totalExercises: result.totalExercises
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('ERROR in program generation:', error.message);
    console.error('Full error:', error);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      {
        error: 'Failed to generate Pilates program',
        details: error.message,
        fullError: error.toString()
      },
      { status: 500 }
    );
  }
}