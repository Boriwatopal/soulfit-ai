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
              text: "Analyze these 4 posture images (front, back, side, bend down) and provide a comprehensive postural assessment. The bend down image shows spinal flexibility and forward bending mechanics. Answer in Thai only, use English words only when transliterated or for specific names."
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
              },
              bend_down_findings: {
                type: "object",
                description: "Observations based on viewing the subject bending forward.",
                properties: {
                  spinal_flexibility: {
                    type: "string",
                    description: "Assessment of spine flexibility and forward bending range."
                  },
                  movement_quality: {
                    type: "string",
                    description: "Quality of the bending movement pattern."
                  },
                  compensations: {
                    type: "string",
                    description: "Any compensatory movements or restrictions observed."
                  },
                  hip_hinge_pattern: {
                    type: "string",
                    description: "Assessment of hip hinge movement pattern."
                  }
                },
                required: [
                  "spinal_flexibility",
                  "movement_quality",
                  "compensations",
                  "hip_hinge_pattern"
                ],
                additionalProperties: false
              }
            },
            required: [
              "front_back_findings",
              "side_findings",
              "bend_down_findings"
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

Bend Down Analysis:
- Spinal Flexibility: ${parsed.bend_down_findings.spinal_flexibility}
- Movement Quality: ${parsed.bend_down_findings.movement_quality}
- Compensations: ${parsed.bend_down_findings.compensations}
- Hip Hinge Pattern: ${parsed.bend_down_findings.hip_hinge_pattern}
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
  selectedEquipment: string[];
}): Promise<any> {
  // Load exercise database
  const exerciseDatabase = await import('@/data/exercises.json');

  // Pre-filter exercises based on selected equipment
  const filteredExercises = exerciseDatabase.exercises.filter(exercise =>
    data.selectedEquipment.includes(exercise.equipment)
  );

  console.log('Pre-filtered exercises:', {
    totalExercises: exerciseDatabase.exercises.length,
    selectedEquipment: data.selectedEquipment,
    filteredCount: filteredExercises.length
  });

  if (filteredExercises.length === 0) {
    throw new Error('No exercises available for selected equipment');
  }

  try {
    console.log('Starting single-phase Pilates program generation...');


    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Pilates instructor creating a personalized 50-minute program. Analyze the user's posture, health, and goals, then select appropriate exercises from the professional database provided. Always respond in Thai language."
        },
        {
          role: "user",
          content: `Create a personalized 50-minute Pilates program by selecting exercises from this FILTERED list based on user's equipment selection:

              SELECTED EQUIPMENT: ${data.selectedEquipment.join(', ')}

              AVAILABLE EXERCISES (filtered by selected equipment):
              ${filteredExercises.map(e => `${e.name} (${e.equipment})`).join(', ')}

              USER DATA TO ANALYZE:

              POSTURE ANALYSIS:
              ${data.postureAnalysis}

              POSTURE RECOMMENDATIONS:
              ${data.recommendations.join(', ')}

              HEALTH ASSESSMENT:
              ${JSON.stringify(data.healthAssessment, null, 2)}

              USER GOALS & PREFERENCES:
              - Experience Level: ${data.userGoals.experienceLevel}
              - Available Time: ${data.userGoals.availableTime} minutes
              - Primary Goal: ${data.userGoals.primaryGoal}
              - Focus Areas: ${data.userGoals.focusAreas?.join(', ')}
              - Selected Equipment: ${data.selectedEquipment.join(', ')}
              - Intensity Preference: ${data.userGoals.preferences?.intensity}

              INSTRUCTIONS:
              1. ANALYZE the user's posture, health, and goals
              2. SELECT exercises ONLY from the filtered list above (these exercises match user's selected equipment)
              3. CREATE a 50-minute structure: warm-up (8-10 min) → main (35 min) → cool-down (5-7 min)
              4. MATCH exercises to experience level and goals
              5. USE ONLY the equipment the user selected: ${data.selectedEquipment.join(', ')}
              6. ONLY use exercises that exist in the filtered list provided above
              7. For exerciseId field, use the format: equipment_exercisename (e.g., "mat_hundred", "reformer_footwork")
              8. RESPOND IN THAI LANGUAGE for all text fields (title, reasoning, targetedIssues, expectedOutcomes, progressionTips)`
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
                    exerciseId: {
                      type: "string",
                      description: "Exercise ID from the database"
                    },
                    duration: { type: "number" },
                    repetitions: { type: "number" },
                    modifications: {
                      type: "array",
                      items: { type: "string" }
                    },
                    reasoning: {
                      type: "string",
                      description: "Why this specific exercise was chosen based on the analysis"
                    }
                  },
                  required: ["exerciseId", "duration", "repetitions", "modifications", "reasoning"],
                  additionalProperties: false
                }
              },
              mainWorkout: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    exerciseId: {
                      type: "string",
                      description: "Exercise ID from the database"
                    },
                    duration: { type: "number" },
                    repetitions: { type: "number" },
                    sets: { type: "number" },
                    modifications: {
                      type: "array",
                      items: { type: "string" }
                    },
                    reasoning: {
                      type: "string",
                      description: "Why this specific exercise was chosen based on the analysis"
                    }
                  },
                  required: ["exerciseId", "duration", "repetitions", "sets", "modifications", "reasoning"],
                  additionalProperties: false
                }
              },
              coolDown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    exerciseId: {
                      type: "string",
                      description: "Exercise ID from the database"
                    },
                    duration: { type: "number" },
                    repetitions: { type: "number" },
                    modifications: {
                      type: "array",
                      items: { type: "string" }
                    },
                    reasoning: {
                      type: "string",
                      description: "Why this specific exercise was chosen based on the analysis"
                    }
                  },
                  required: ["exerciseId", "duration", "repetitions", "modifications", "reasoning"],
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
      },
      max_completion_tokens: 7500
    });

    console.log('OpenAI Response received:', {
      choices: response.choices?.length,
      firstChoice: response.choices?.[0]?.message?.content ? 'Has content' : 'No content',
      responseId: response.id,
      usage: response.usage
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in OpenAI response:', JSON.stringify(response, null, 2));
      throw new Error('No program response from GPT-5');
    }

    const parsed = JSON.parse(content);

    // Expand exerciseIds to full exercise details
    const expandExercises = (exercises: any[]) => {
      return exercises.map(ex => {
        // Try to find exercise by matching name and equipment from exerciseId
        const exerciseDetail = filteredExercises.find(e => {
          const idToMatch = ex.exerciseId.toLowerCase().replace(/[^a-z]/g, '');
          const equipmentName = `${e.equipment.toLowerCase().replace(/\s+/g, '')}${e.name.toLowerCase().replace(/[^a-z]/g, '')}`;
          return idToMatch === equipmentName || e.name === ex.exerciseId;
        });

        if (!exerciseDetail) {
          console.warn(`Exercise ID ${ex.exerciseId} not found in filtered database, attempting fallback`);
          // Fallback: try to extract equipment and name from exerciseId
          return {
            name: ex.exerciseId,
            equipment: 'Unknown',
            duration: ex.duration,
            repetitions: ex.repetitions,
            sets: ex.sets,
            modifications: ex.modifications || [],
            reasoning: ex.reasoning
          };
        }
        return {
          name: exerciseDetail.name,
          equipment: exerciseDetail.equipment,
          duration: ex.duration,
          repetitions: ex.repetitions,
          sets: ex.sets,
          modifications: ex.modifications || [],
          reasoning: ex.reasoning
        };
      });
    };

    // Expand all exercise sections
    parsed.warmUp = expandExercises(parsed.warmUp || []);
    parsed.mainWorkout = expandExercises(parsed.mainWorkout || []);
    parsed.coolDown = expandExercises(parsed.coolDown || []);
    
    // Add generated ID and timestamp if not present
    if (!parsed.id) {
      parsed.id = `program_${Date.now()}`;
    }
    parsed.createdAt = new Date();
    
    console.log('Pilates program generated successfully with exercise selection from database');

    return parsed;
  } catch (error) {
    console.error('Error generating program:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
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