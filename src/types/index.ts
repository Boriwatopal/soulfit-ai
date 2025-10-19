export interface PostureAnalysis {
  id: string;
  frontImage: File | null;
  backImage: File | null;
  sideImage: File | null;
  bendDownImage: File | null;
  analysis?: string;
  recommendations?: string[];
}

export interface BodyCompositionReport {
  // Basic Info
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  height?: number; // cm
  weight?: number; // kg
  testDate?: string;
  overallRating?: number; // 0-100

  // Body Composition Details
  intracellularFluid?: number; // L
  extracellularFluid?: number; // L
  bodyWater?: number; // kg
  muscleMass?: number; // kg
  leanBodyMass?: number; // kg
  protein?: number; // kg
  minerals?: number; // kg
  fatMass?: number; // kg

  // Analysis Results
  bmi?: number;
  bodyFatPercentage?: number;
  skeletalMuscleMass?: number; // kg
  
  // Belly Fat
  visceralFatArea?: number; // cm²
  subcutaneousFatArea?: number; // cm²
  bodyWaterFatFreeRatio?: number; // kg/L

  // Segmental Analysis
  segmentalData?: {
    rightArm?: { muscle: number; fat: number };
    leftArm?: { muscle: number; fat: number };
    torso?: { muscle: number; fat: number };
    rightLeg?: { muscle: number; fat: number };
    leftLeg?: { muscle: number; fat: number };
  };

  // Nutritional Status
  nutritionalAssessment?: {
    protein?: 'Low' | 'Normal' | 'High';
    fat?: 'Low' | 'Low-normal' | 'Normal' | 'High';
    minerals?: 'Low' | 'Normal' | 'High';
    water?: 'Low' | 'Normal' | 'High';
  };

  // Exercise Recommendations
  caloriesPerDay?: number;
  exerciseRecommendations?: {
    walking?: number; // minutes
    running?: number; // minutes
    swimming?: number; // minutes
  };

  // Historical Data
  previousWeight?: number;
  previousBodyWater?: number;
  previousFatPercentage?: number;
}

export interface HealthAssessment {
  id: string;
  bodyCompositionReport?: BodyCompositionReport;
  reportImage?: File; // For uploaded body composition report
  extractedFromImage?: boolean; // Flag to indicate if data was extracted from image
  additionalImages?: File[];
  healthConditions?: string[];
  injuries?: string[];
  notes?: string;
}

export interface UserGoals {
  primaryGoal: 'strength' | 'flexibility' | 'rehabilitation' | 'weight-loss' | 'general-fitness';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  availableTime: 30 | 45 | 60;
  frequency: 2 | 3 | 4 | 5;
  focusAreas: string[];
  limitations: string[];
  preferences: {
    equipment: string[];
    intensity: 'low' | 'moderate' | 'high';
    style: 'classical' | 'contemporary' | 'mixed';
  };
  
  // New comprehensive goal fields
  otherGoals?: string;
  hasExercisedBefore?: boolean;
  hasPilatesExperience?: boolean;
  preferredStyle?: 'slow' | 'fast' | 'challenging' | 'relaxing';
  motivation?: string;
  expectedResults?: string;
  pastBarriers?: string;
  potentialObstacles?: string[];
  concerns?: string[];
  medicalConditions?: string[];
  otherMedicalConditions?: string;
  medicalReleaseRequired?: boolean;
  
  // Physical measurements
  height?: number;
  weight?: number;
  bodyFatPercentage?: number;
  oxygenLevel?: number;
  bloodPressure?: string;
  restingHeartRate?: number;
  chestMeasurement?: number;
  waistMeasurement?: number;
  hipMeasurement?: number;
  leftArmMeasurement?: number;
  rightArmMeasurement?: number;
  leftThighMeasurement?: number;
  rightThighMeasurement?: number;
  
  // Expectations
  desiredTransformation?: string;
  inspiration?: string;
  preferredInstructorType?: 'encouraging' | 'calm' | 'strict';
  preferredTrainingStyle?: 'detailed' | 'fun' | 'others';
}

export interface Exercise {
  name: string;
  description: string;
  duration: number;
  repetitions?: number;
  sets?: number;
  modifications?: string[];
  targetAreas: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  equipment?: string[];
  reasoning: string; // Why this specific exercise was chosen based on the analysis
}

export interface ComprehensiveAnalysis {
  movement_assessment: {
    primary_dysfunctions: string[];
    muscle_imbalances: string[];
    postural_deviations: string[];
    mobility_restrictions: string[];
  };
  health_considerations: {
    body_composition_insights: string;
    strength_levels: string;
    risk_factors: string[];
    exercise_contraindications: string[];
  };
  priority_areas: {
    immediate_focus: string[];
    secondary_goals: string[];
    long_term_objectives: string[];
  };
  pilates_strategy: {
    key_principles: string[];
    optimal_exercise_types: string[];
    progression_approach: string;
    session_structure_rationale: string;
  };
}

export interface PilatesProgram {
  id: string;
  title: string;
  duration: number;
  totalExercises: number;
  warmUp: Exercise[];
  mainWorkout: Exercise[];
  coolDown: Exercise[];
  comprehensive_analysis: ComprehensiveAnalysis; // Detailed analysis that guided the program design
  reasoning: string;
  targetedIssues: string[];
  expectedOutcomes: string[];
  progressionTips: string[];
  createdAt: Date;
}

export interface AppState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  postureAnalysis: PostureAnalysis;
  healthAssessment: HealthAssessment;
  userGoals: UserGoals;
  selectedEquipment: string[];
  generatedProgram?: PilatesProgram;
  isLoading: boolean;
  error?: string;
}