import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzePosture(images: File[]): Promise<{
  analysis: string;
  recommendations: string[];
}> {
  try {
    const imagePromises = images.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:${file.type};base64,${base64}`;
    });

    const imageUrls = await Promise.all(imagePromises);

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze these 4 posture images (front, back, left side, right side) and provide a comprehensive postural assessment. Answer in Thai only, use English words only when transliterated or for specific names."
            },
            ...imageUrls.map(url => ({
              type: "image_url" as const,
              image_url: {
                url: url
              }
            }))
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "postural_assessment",
          strict: true,
          schema: {
            type: "object",
            properties: {
              front_back_findings: {
                type: "object",
                description: "Observations based on viewing the subject from the front or back.",
                properties: {
                  head_asymmetry: {
                    type: "string",
                    description: "Description of right-to-left asymmetry or tilt/rotation in the head."
                  },
                  shoulder_and_scapular: {
                    type: "string",
                    description: "Observations about shoulder level and scapular positioning."
                  },
                  feet_position: {
                    type: "string",
                    description: "Notes on how the feet are positioned or rotated."
                  }
                },
                required: [
                  "head_asymmetry",
                  "shoulder_and_scapular", 
                  "feet_position"
                ],
                additionalProperties: false
              },
              side_findings: {
                type: "object",
                description: "Observations based on viewing the subject from the side.",
                properties: {
                  head_posture: {
                    type: "string",
                    description: "Description of head position relative to the body."
                  },
                  shoulder_posture: {
                    type: "string",
                    description: "Observations about the shoulders and upper-back curvature."
                  },
                  lumbar_pelvic_posture: {
                    type: "string",
                    description: "Description of lumbar curve and pelvic alignment."
                  },
                  knee_observation: {
                    type: "string",
                    description: "Notes on the knee joint posture."
                  }
                },
                required: [
                  "head_posture",
                  "shoulder_posture",
                  "lumbar_pelvic_posture",
                  "knee_observation"
                ],
                additionalProperties: false
              }
            },
            required: [
              "front_back_findings",
              "side_findings"
            ],
            additionalProperties: false
          }
        }
      },
      max_completion_tokens: 5000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    try {
      const parsed = JSON.parse(content);
      
      // Convert the new simplified schema to the expected format
      const analysis = `
Front/Back View Analysis:
- Head: ${parsed.front_back_findings.head_asymmetry}
- Shoulders: ${parsed.front_back_findings.shoulder_and_scapular}
- Feet: ${parsed.front_back_findings.feet_position}

Side View Analysis:
- Head Posture: ${parsed.side_findings.head_posture}
- Shoulder Posture: ${parsed.side_findings.shoulder_posture}
- Lumbar/Pelvic: ${parsed.side_findings.lumbar_pelvic_posture}
- Knees: ${parsed.side_findings.knee_observation}
      `.trim();

      // Generate recommendations based on findings
      const recommendations = [];
      
      // Head and neck recommendations
      if (parsed.side_findings.head_posture.toLowerCase().includes('forward')) {
        recommendations.push("Focus on cervical spine alignment exercises");
        recommendations.push("Strengthen deep neck flexors");
      }
      
      // Shoulder recommendations
      if (parsed.side_findings.shoulder_posture.toLowerCase().includes('rounded')) {
        recommendations.push("Strengthen middle trapezius and rhomboids");
        recommendations.push("Stretch chest muscles and anterior deltoids");
      }
      
      // Pelvic recommendations
      if (parsed.side_findings.lumbar_pelvic_posture.toLowerCase().includes('tilt')) {
        recommendations.push("Core stabilization exercises for pelvic alignment");
      }
      
      // General recommendation
      recommendations.push("Focus on postural awareness throughout daily activities");

      return {
        analysis,
        recommendations,
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        analysis: content,
        recommendations: ['Follow the analysis recommendations provided above'],
      };
    }
  } catch (error) {
    console.error('Error analyzing posture:', error);
    throw new Error('Failed to analyze posture images');
  }
}

export async function generatePilatesProgram(data: {
  postureAnalysis: string;
  recommendations: string[];
  healthAssessment: any;
  userGoals: any;
}): Promise<any> {
  try {
    console.log('Starting two-phase Pilates program generation...');
    
    // PHASE 1: Comprehensive Analysis
    console.log('Phase 1: Analyzing health and posture data...');
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Pilates instructor, movement specialist, and health analyst. Analyze all provided health and posture data to create a comprehensive assessment that will guide program design."
        },
        {
          role: "user",
          content: `Perform a comprehensive analysis of this person's health and movement profile:

              POSTURE ANALYSIS RESULTS:
              ${data.postureAnalysis}
              
              POSTURE RECOMMENDATIONS:
              ${data.recommendations.join(', ')}
              
              HEALTH ASSESSMENT DATA:
              ${JSON.stringify(data.healthAssessment, null, 2)}
              
              USER GOALS & PREFERENCES:
              ${JSON.stringify(data.userGoals, null, 2)}
              
              Please provide a detailed analysis that identifies:
              1. Primary movement dysfunctions and imbalances
              2. Key health metrics that impact exercise selection
              3. Risk factors and contraindications
              4. Priority areas for improvement
              5. Optimal exercise strategies based on their body composition and goals
              6. Specific Pilates principles that would benefit this individual most
              
              This analysis will be used to design a personalized Pilates program.`
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
                    description: "Key postural issues to address"
                  },
                  mobility_restrictions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas with limited mobility or flexibility"
                  }
                },
                required: ["primary_dysfunctions", "muscle_imbalances", "postural_deviations", "mobility_restrictions"],
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
      },
      max_completion_tokens: 5000
    });

    const analysisContent = analysisResponse.choices[0]?.message?.content;
    if (!analysisContent) throw new Error('No analysis response from GPT-5');
    
    const comprehensiveAnalysis = JSON.parse(analysisContent);
    console.log('Phase 1 complete: Comprehensive analysis generated');

    // PHASE 2: Program Design Based on Analysis
    console.log('Phase 2: Designing specific Pilates program...');
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Pilates instructor creating a specific 50-minute program. Use the comprehensive analysis to design exercises with detailed reasoning for each choice."
        },
        {
          role: "user",
          content: `Based on this comprehensive analysis, design a specific 50-minute Pilates program:

              COMPREHENSIVE ANALYSIS:
              ${JSON.stringify(comprehensiveAnalysis, null, 2)}
              
              ORIGINAL USER DATA:
              - Experience Level: ${data.userGoals.experienceLevel}
              - Available Time: ${data.userGoals.availableTime} minutes
              - Primary Goal: ${data.userGoals.primaryGoal}
              - Focus Areas: ${data.userGoals.focusAreas?.join(', ')}
              - Equipment Available: ${data.userGoals.preferences?.equipment?.join(', ')}
              - Intensity Preference: ${data.userGoals.preferences?.intensity}
              
              Create a detailed 50-minute program with:
              - Warm-up (8-10 minutes): Prepare the body for the specific issues identified
              - Main workout (35 minutes): Target the priority areas with appropriate exercises
              - Cool-down (5-7 minutes): Address flexibility and recovery needs
              
              For EACH exercise, explain WHY it was chosen based on the analysis.`
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
                      description: "Why this specific exercise was chosen based on the analysis"
                    }
                  },
                  required: ["name", "description", "duration", "targetAreas", "difficulty", "reasoning"],
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
                  required: ["name", "description", "duration", "targetAreas", "difficulty", "reasoning"],
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
                      description: "Why this specific exercise was chosen based on the analysis"
                    }
                  },
                  required: ["name", "description", "duration", "targetAreas", "difficulty", "reasoning"],
                  additionalProperties: false
                }
              },
              comprehensive_analysis: {
                type: "object",
                description: "The detailed analysis that guided this program design",
                properties: {
                  movement_assessment: { type: "object" },
                  health_considerations: { type: "object" },
                  priority_areas: { type: "object" },
                  pilates_strategy: { type: "object" }
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
            required: ["id", "title", "duration", "totalExercises", "warmUp", "mainWorkout", "coolDown", "comprehensive_analysis", "reasoning", "targetedIssues", "expectedOutcomes", "progressionTips"],
            additionalProperties: false
          }
        }
      },
      max_completion_tokens: 5000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No program response from GPT-5');

    const parsed = JSON.parse(content);
    
    // Add the comprehensive analysis to the final program
    parsed.comprehensive_analysis = comprehensiveAnalysis;
    
    // Add generated ID and timestamp if not present
    if (!parsed.id) {
      parsed.id = `program_${Date.now()}`;
    }
    parsed.createdAt = new Date();
    
    console.log('Phase 2 complete: Detailed Pilates program generated with exercise reasoning');
    console.log('Two-phase program generation completed successfully');

    return parsed;
  } catch (error) {
    console.error('Error generating program:', error);
    throw new Error('Failed to generate Pilates program');
  }
}

export async function extractBodyCompositionData(reportImage: File): Promise<any> {
  try {
    console.log('Starting body composition extraction with GPT-5-Mini');
    
    const buffer = await reportImage.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    console.log('Image converted to base64, length:', base64.length);

    console.log('Calling GPT-5-Mini API...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this body composition report image and extract all numerical data, measurements, and health metrics. Read all text, numbers, charts, and tables visible in the image. Convert the extracted data into the JSON format specified in the schema. Answer in Thai only, use English words only when transliterated or for specific names."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${reportImage.type};base64,${base64}`
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "body_composition_report",
          strict: true,
          schema: {
            "type": "object",
            "properties": {
              "basic_info": {
                "type": "object",
                "properties": {
                  "age": {
                    "type": "integer",
                    "description": "Age in years"
                  },
                  "gender": {
                    "type": "string",
                    "description": "Biological gender",
                    "enum": ["Male", "Female"]
                  },
                  "height_cm": {
                    "type": "number",
                    "description": "Height in centimeters",
                    "minimum": 50,
                    "maximum": 250
                  },
                  "weight_kg": {
                    "type": "number",
                    "description": "Weight in kilograms",
                    "minimum": 20,
                    "maximum": 250
                  },
                  "test_date": {
                    "type": "string",
                    "description": "Date of the physical test in YYYY-MM-DD format",
                    "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
                  },
                  "overall_rating": {
                    "type": "number",
                    "description": "Overall health/composition rating out of 100",
                    "minimum": 0,
                    "maximum": 100
                  }
                },
                "required": ["age", "gender", "height_cm", "weight_kg", "test_date", "overall_rating"],
                "additionalProperties": false
              },
              "body_composition": {
                "type": "object",
                "properties": {
                  "intracellular_fluid_L": { "type": "number", "description": "Intracellular fluid in liters" },
                  "extracellular_fluid_L": { "type": "number", "description": "Extracellular fluid in liters" },
                  "body_water_kg": { "type": "number", "description": "Total body water in kg" },
                  "body_water_range_kg": { "type": "string", "description": "Standard range for total body water in kg" },
                  "muscle_mass_kg": { "type": "number", "description": "Skeletal muscle mass in kg" },
                  "muscle_mass_range_kg": { "type": "string", "description": "Standard range for muscle mass in kg" },
                  "lean_mass_kg": { "type": "number", "description": "Lean body mass in kg" },
                  "lean_mass_range_kg": { "type": "string", "description": "Standard range for lean mass in kg" },
                  "protein_kg": { "type": "number", "description": "Protein mass in kg" },
                  "protein_range_kg": { "type": "string", "description": "Standard protein range in kg" },
                  "minerals_kg": { "type": "number", "description": "Minerals mass in kg" },
                  "minerals_range_kg": { "type": "string", "description": "Standard range for minerals in kg" },
                  "fat_mass_kg": { "type": "number", "description": "Fat mass in kg" },
                  "fat_mass_range_kg": { "type": "string", "description": "Standard range for fat mass in kg" }
                },
                "required": ["intracellular_fluid_L", "extracellular_fluid_L", "body_water_kg", "body_water_range_kg", "muscle_mass_kg", "muscle_mass_range_kg", "lean_mass_kg", "lean_mass_range_kg", "protein_kg", "protein_range_kg", "minerals_kg", "minerals_range_kg", "fat_mass_kg", "fat_mass_range_kg"],
                "additionalProperties": false
              },
              "muscle_fat_analysis": {
                "type": "object",
                "properties": {
                  "bmi": { "type": "number", "description": "Body mass index" },
                  "bmi_range": { "type": "string", "description": "Normal BMI range" },
                  "body_fat_percentage": { "type": "number", "description": "Percent of body fat" },
                  "body_fat_description": { "type": "string", "description": "Description of body fat percentage" },
                  "weight_observation": { "type": "string", "description": "Comment on weight relative to height" },
                  "skeletal_muscle_mass_observation": { "type": "string", "description": "Comment on skeletal muscle mass" }
                },
                "required": ["bmi", "body_fat_percentage", "bmi_range", "body_fat_description", "weight_observation", "skeletal_muscle_mass_observation"],
                "additionalProperties": false
              },
              "belly_fat": {
                "type": "object",
                "properties": {
                  "visceral_fat_area_cm2": { "type": "number", "description": "Visceral fat area in square centimeters" },
                  "visceral_fat_area_healthy_upper_cm2": { "type": "number", "description": "Healthy reference upper bound for visceral fat area (cm²)" },
                  "subcutaneous_fat_area_cm2": { "type": "number", "description": "Subcutaneous fat area in square centimeters" },
                  "body_water_fat_free_mass_ratio": { "type": "number", "description": "Body water/fat-free mass ratio in kg/L" }
                },
                "required": ["visceral_fat_area_cm2", "visceral_fat_area_healthy_upper_cm2", "subcutaneous_fat_area_cm2", "body_water_fat_free_mass_ratio"],
                "additionalProperties": false
              },
              "segmental_analysis": {
                "type": "object",
                "properties": {
                  "right_arm": { "$ref": "#/$defs/segment" },
                  "left_arm": { "$ref": "#/$defs/segment" },
                  "torso": { "$ref": "#/$defs/segment" },
                  "right_leg": { "$ref": "#/$defs/segment" },
                  "left_leg": { "$ref": "#/$defs/segment" },
                  "muscle_balance_comment": { "type": "string", "description": "Muscle balance summary between sides" }
                },
                "required": ["right_arm", "left_arm", "torso", "right_leg", "left_leg", "muscle_balance_comment"],
                "additionalProperties": false
              },
              "nutritional_assessment": {
                "type": "object",
                "properties": {
                  "protein": { "type": "string", "description": "Protein assessment" },
                  "fat": { "type": "string", "description": "Fat assessment" },
                  "minerals": { "type": "string", "description": "Minerals assessment" },
                  "water": { "type": "string", "description": "Water status" }
                },
                "required": ["protein", "fat", "minerals", "water"],
                "additionalProperties": false
              },
              "history": {
                "type": "object",
                "properties": {
                  "previous_weight_kg": { "type": "number", "description": "Recorded previous weight in kg" },
                  "previous_body_water_kg": { "type": "number", "description": "Recorded previous body water in kg" },
                  "previous_fat_percentage": { "type": "number", "description": "Recorded previous body fat percentage" },
                  "history_comment": { "type": "string", "description": "General comment or note on historical data" }
                },
                "required": ["previous_weight_kg", "previous_body_water_kg", "previous_fat_percentage", "history_comment"],
                "additionalProperties": false
              }
            },
            "required": ["basic_info", "body_composition", "muscle_fat_analysis", "belly_fat", "segmental_analysis", "nutritional_assessment", "history"],
            "additionalProperties": false,
            "$defs": {
              "segment": {
                "type": "object",
                "properties": {
                  "muscle_mass_kg": {
                    "type": "number",
                    "description": "Muscle mass for the segment in kg"
                  },
                  "fat_mass_kg": {
                    "type": "number",
                    "description": "Fat mass for the segment in kg"
                  }
                },
                "required": ["muscle_mass_kg", "fat_mass_kg"],
                "additionalProperties": false
              }
            }
          }
        }
      },
      max_completion_tokens: 10000
    });

    console.log('GPT-5-Mini API Response received');

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content found in GPT-5-Mini response');
      console.log('Full response:', JSON.stringify(response, null, 2));
      throw new Error('No response content from GPT-5-Mini');
    }

    console.log('Raw content length:', content.length);
    let parsed;
    
    try {
      parsed = JSON.parse(content);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Content that failed to parse:', content.substring(0, 500) + '...');
      throw new Error('Failed to parse GPT-5-Mini response as JSON');
    }
    
    // Map GPT-5 response structure to our BodyCompositionReport interface
    return {
      // Basic Info
      age: parsed.basic_info?.age,
      gender: parsed.basic_info?.gender,
      height: parsed.basic_info?.height_cm,
      weight: parsed.basic_info?.weight_kg,
      testDate: parsed.basic_info?.test_date,
      overallRating: parsed.basic_info?.overall_rating,
      
      // Body Composition
      intracellularFluid: parsed.body_composition?.intracellular_fluid_L,
      extracellularFluid: parsed.body_composition?.extracellular_fluid_L,
      bodyWater: parsed.body_composition?.body_water_kg,
      muscleMass: parsed.body_composition?.muscle_mass_kg,
      leanBodyMass: parsed.body_composition?.lean_mass_kg,
      protein: parsed.body_composition?.protein_kg,
      minerals: parsed.body_composition?.minerals_kg,
      fatMass: parsed.body_composition?.fat_mass_kg,
      
      // Analysis
      bmi: parsed.muscle_fat_analysis?.bmi,
      bodyFatPercentage: parsed.muscle_fat_analysis?.body_fat_percentage,
      skeletalMuscleMass: parsed.body_composition?.muscle_mass_kg, // Same as muscle mass
      
      // Belly Fat
      visceralFatArea: parsed.belly_fat?.visceral_fat_area_cm2,
      subcutaneousFatArea: parsed.belly_fat?.subcutaneous_fat_area_cm2,
      bodyWaterFatFreeRatio: parsed.belly_fat?.body_water_fat_free_mass_ratio,
      
      // Segmental Data - map the new structure
      segmentalData: {
        rightArm: {
          muscle: parsed.segmental_analysis?.right_arm?.muscle_mass_kg,
          fat: parsed.segmental_analysis?.right_arm?.fat_mass_kg
        },
        leftArm: {
          muscle: parsed.segmental_analysis?.left_arm?.muscle_mass_kg,
          fat: parsed.segmental_analysis?.left_arm?.fat_mass_kg
        },
        torso: {
          muscle: parsed.segmental_analysis?.torso?.muscle_mass_kg,
          fat: parsed.segmental_analysis?.torso?.fat_mass_kg
        },
        rightLeg: {
          muscle: parsed.segmental_analysis?.right_leg?.muscle_mass_kg,
          fat: parsed.segmental_analysis?.right_leg?.fat_mass_kg
        },
        leftLeg: {
          muscle: parsed.segmental_analysis?.left_leg?.muscle_mass_kg,
          fat: parsed.segmental_analysis?.left_leg?.fat_mass_kg
        }
      },
      
      // Nutritional Assessment
      nutritionalAssessment: {
        protein: parsed.nutritional_assessment?.protein,
        fat: parsed.nutritional_assessment?.fat,
        minerals: parsed.nutritional_assessment?.minerals,
        water: parsed.nutritional_assessment?.water
      },
      
      // Historical Data
      previousWeight: parsed.history?.previous_weight_kg,
      previousBodyWater: parsed.history?.previous_body_water_kg,
      previousFatPercentage: parsed.history?.previous_fat_percentage,
    };
  } catch (error) {
    console.error('Error extracting body composition data:', error);
    throw new Error('Failed to extract data from body composition report');
  }
}

export { openai };