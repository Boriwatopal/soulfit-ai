import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to create reasoning ID like in your example
function createReasoningId() {
  return `rs_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== API: Starting Two-Phase Program Generation ===');
    
    const body = await request.json();
    const { postureAnalysis, recommendations, healthAssessment, userGoals } = body;

    console.log('API: Received data:', {
      hasPostureAnalysis: !!postureAnalysis,
      postureAnalysisLength: postureAnalysis?.length,
      hasRecommendations: !!recommendations,
      recommendationsCount: recommendations?.length,
      hasHealthAssessment: !!healthAssessment,
      hasUserGoals: !!userGoals,
      userGoalType: userGoals?.primaryGoal
    });

    if (!postureAnalysis) {
      console.log('ERROR: Missing posture analysis data');
      return NextResponse.json(
        { error: 'Posture analysis is required' },
        { status: 400 }
      );
    }

    // Add a small delay to show it's actually processing
    console.log('⏳ Preparing for Phase 1 Analysis...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // PHASE 1: Comprehensive Physical Assessment Analysis
    console.log('Phase 1: Analyzing posture images and health data...');
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: `Analyze this person's physical condition:

POSTURE ANALYSIS: ${postureAnalysis}
RECOMMENDATIONS: ${recommendations.join(', ')}
HEALTH DATA: ${JSON.stringify(healthAssessment, null, 2)}

Provide a comprehensive physical assessment focusing on movement patterns, muscle imbalances, and health considerations. Answer in Thai only, use English words only when transliterated or for specific names.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "comprehensive_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              movement_assessment: {
                type: "object",
                properties: {
                  primary_dysfunctions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Main movement patterns that need correction"
                  },
                  muscle_imbalances: {
                    type: "array", 
                    items: { type: "string" },
                    description: "Specific muscle imbalances identified"
                  },
                  postural_deviations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific postural issues observed from the 4-angle images"
                  },
                  mobility_restrictions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas with limited mobility or flexibility based on posture"
                  },
                  postural_description: {
                    type: "string",
                    description: "Detailed description of overall posture from front, back, and side views"
                  }
                },
                required: ["primary_dysfunctions", "muscle_imbalances", "postural_deviations", "mobility_restrictions", "postural_description"],
                additionalProperties: false
              },
              health_considerations: {
                type: "object",
                properties: {
                  body_composition_insights: {
                    type: "string",
                    description: "How body composition affects exercise selection"
                  },
                  strength_levels: {
                    type: "string",
                    description: "Assessment of overall strength capacity"
                  },
                  risk_factors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Health conditions or injuries that require modifications"
                  },
                  exercise_contraindications: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exercises or movements to avoid"
                  }
                },
                required: ["body_composition_insights", "strength_levels", "risk_factors", "exercise_contraindications"],
                additionalProperties: false
              },
              priority_areas: {
                type: "object",
                properties: {
                  immediate_focus: {
                    type: "array",
                    items: { type: "string" },
                    description: "Most critical areas requiring immediate attention"
                  },
                  secondary_goals: {
                    type: "array",
                    items: { type: "string" },
                    description: "Important but secondary improvement areas"
                  },
                  long_term_objectives: {
                    type: "array",
                    items: { type: "string" },
                    description: "Goals for ongoing development"
                  }
                },
                required: ["immediate_focus", "secondary_goals", "long_term_objectives"],
                additionalProperties: false
              },
              pilates_strategy: {
                type: "object",
                properties: {
                  key_principles: {
                    type: "array",
                    items: { type: "string" },
                    description: "Which Pilates principles will benefit this person most"
                  },
                  optimal_exercise_types: {
                    type: "array",
                    items: { type: "string" },
                    description: "Types of Pilates exercises most beneficial"
                  },
                  progression_approach: {
                    type: "string",
                    description: "How to structure progression for this individual"
                  },
                  session_structure_rationale: {
                    type: "string",
                    description: "Why specific session structure will be most effective"
                  }
                },
                required: ["key_principles", "optimal_exercise_types", "progression_approach", "session_structure_rationale"],
                additionalProperties: false
              }
            },
            required: ["movement_assessment", "health_considerations", "priority_areas", "pilates_strategy"],
            additionalProperties: false
          }
        }
      }
    });

    // Extract analysis content
    const analysisContent = analysisResponse.choices[0]?.message?.content;
    if (!analysisContent) throw new Error('No analysis response from GPT-5-Mini');
    const comprehensiveAnalysis = JSON.parse(analysisContent);
    console.log('✅ Phase 1 complete: Physical assessment analysis generated');
    console.log('Analysis includes:', Object.keys(comprehensiveAnalysis));

    // Delay between phases to show distinct processing
    console.log('⏳ Processing analysis results and preparing Phase 2...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // PHASE 2: Goal-Oriented Program Design
    console.log('🎯 Phase 2: Connecting physical analysis with user goals to design program...');
    const programResponse = await openai.chat.completions.create({
      model: "gpt-5-mini", 
      messages: [
        {
          role: "user",
          content: `As an expert Pilates instructor, create a 50-minute exercise program based on this data:

ANALYSIS: ${JSON.stringify(comprehensiveAnalysis, null, 2)}

USER GOALS:
- Primary Goal: ${userGoals.primaryGoal}
- Experience: ${userGoals.experienceLevel}
- Focus Areas: ${userGoals.focusAreas?.join(', ')}
- Available Time: 50 minutes

Create a program with warm-up, main workout using reformer machine, and cool-down exercises. Each exercise should include name, description, duration, repetitions, target areas, difficulty, and reasoning. Answer in Thai only, use English words only when transliterated or for specific names.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pilates_program",
          strict: true,
          schema: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique program identifier"
              },
              title: {
                type: "string", 
                description: "Program title"
              },
              duration: {
                type: "number",
                description: "Total program duration in minutes"
              },
              totalExercises: {
                type: "number",
                description: "Total number of exercises"
              },
              warmUp: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    duration: { type: "number" },
                    repetitions: { type: "number" },
                    targetAreas: {
                      type: "array",
                      items: { type: "string" }
                    },
                    difficulty: {
                      type: "string",
                      enum: ["easy", "medium", "hard"]
                    },
                    modifications: {
                      type: "array",
                      items: { type: "string" }
                    },
                    reasoning: {
                      type: "string",
                      description: "Why this exercise was chosen: connection between physical assessment findings and user goals"
                    }
                  },
                  required: ["name", "description", "duration", "repetitions", "targetAreas", "difficulty", "modifications", "reasoning"],
                  additionalProperties: false
                }
              },
              mainWorkout: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    duration: { type: "number" },
                    repetitions: { type: "number" },
                    sets: { type: "number" },
                    targetAreas: {
                      type: "array",
                      items: { type: "string" }
                    },
                    difficulty: {
                      type: "string",
                      enum: ["easy", "medium", "hard"]
                    },
                    modifications: {
                      type: "array",
                      items: { type: "string" }
                    },
                    equipment: {
                      type: "array",
                      items: { type: "string" }
                    },
                    reasoning: {
                      type: "string", 
                      description: "Why this specific exercise was chosen based on the analysis"
                    }
                  },
                  required: ["name", "description", "duration", "repetitions", "sets", "targetAreas", "difficulty", "modifications", "equipment", "reasoning"],
                  additionalProperties: false
                }
              },
              coolDown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    duration: { type: "number" },
                    repetitions: { type: "number" },
                    targetAreas: {
                      type: "array",
                      items: { type: "string" }
                    },
                    difficulty: {
                      type: "string",
                      enum: ["easy", "medium", "hard"]
                    },
                    modifications: {
                      type: "array",
                      items: { type: "string" }
                    },
                    reasoning: {
                      type: "string",
                      description: "Why this exercise was chosen: connection between physical assessment findings and user goals"
                    }
                  },
                  required: ["name", "description", "duration", "repetitions", "targetAreas", "difficulty", "modifications", "reasoning"],
                  additionalProperties: false
                }
              },
              reasoning: {
                type: "string",
                description: "Overall explanation of why this program was designed this way"
              },
              targetedIssues: {
                type: "array",
                items: { type: "string" },
                description: "Issues this program specifically addresses"
              },
              expectedOutcomes: {
                type: "array",
                items: { type: "string" },
                description: "Expected benefits and improvements"
              },
              progressionTips: {
                type: "array",
                items: { type: "string" },
                description: "How to progress and advance the program"
              }
            },
            required: ["id", "title", "duration", "totalExercises", "warmUp", "mainWorkout", "coolDown", "reasoning", "targetedIssues", "expectedOutcomes", "progressionTips"],
            additionalProperties: false
          }
        }
      }
    });

    // Extract program content
    console.log('📋 Program Response received:', {
      hasChoices: !!programResponse.choices,
      choicesLength: programResponse.choices?.length,
      hasMessage: !!programResponse.choices?.[0]?.message,
      hasContent: !!programResponse.choices?.[0]?.message?.content,
      contentLength: programResponse.choices?.[0]?.message?.content?.length
    });
    
    const programContent = programResponse.choices[0]?.message?.content;
    if (!programContent) {
      console.error('❌ No content in GPT-5-Mini response:', JSON.stringify(programResponse, null, 2));
      throw new Error('No program response from GPT-5-Mini');
    }
    const parsed = JSON.parse(programContent);
    
    // Add the comprehensive analysis to the final program
    parsed.comprehensive_analysis = comprehensiveAnalysis;
    
    // Add generated ID and timestamp if not present
    if (!parsed.id) {
      parsed.id = 'program_' + Date.now();
    }
    parsed.createdAt = new Date();
    
    console.log('✅ Phase 2 complete: Detailed Pilates program generated');
    console.log('📊 Program summary:', {
      title: parsed.title,
      duration: parsed.duration,
      warmUpCount: parsed.warmUp?.length || 0,
      mainWorkoutCount: parsed.mainWorkout?.length || 0,
      coolDownCount: parsed.coolDown?.length || 0,
      totalExercises: parsed.totalExercises
    });
    console.log('🎉 Two-phase program generation completed successfully');

    return NextResponse.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error('❌ ERROR in program generation API:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      phase: error.message.includes('analysis') ? 'Phase 1' : 'Phase 2'
    });
    
    // Check if it's an OpenAI API error
    if (error.message.includes('OpenAI') || error.status) {
      console.error('🔥 OpenAI API Error detected:', {
        status: error.status,
        type: error.type,
        code: error.code
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate Pilates program',
        details: error.message,
        phase: error.message.includes('analysis') ? 'Phase 1 Analysis' : 'Phase 2 Design'
      },
      { status: 500 }
    );
  }
}