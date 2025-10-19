import { create } from 'zustand';
import { AppState, PostureAnalysis, HealthAssessment, UserGoals, PilatesProgram } from '@/types';

interface AppStore extends AppState {
  setCurrentStep: (step: 1 | 2 | 3 | 4 | 5 | 6) => void;
  updatePostureAnalysis: (data: Partial<PostureAnalysis>) => void;
  updateHealthAssessment: (data: Partial<HealthAssessment>) => void;
  updateUserGoals: (data: Partial<UserGoals>) => void;
  updateSelectedEquipment: (equipment: string[]) => void;
  setGeneratedProgram: (program: PilatesProgram) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  resetStore: () => void;
  nextStep: () => void;
  previousStep: () => void;
}

const initialState: AppState = {
  currentStep: 1,
  postureAnalysis: {
    id: '',
    frontImage: null,
    backImage: null,
    sideImage: null,
    bendDownImage: null,
  },
  healthAssessment: {
    id: '',
  },
  userGoals: {
    primaryGoal: 'general-fitness',
    experienceLevel: 'beginner',
    availableTime: 45,
    frequency: 3,
    focusAreas: [],
    limitations: [],
    preferences: {
      equipment: [],
      intensity: 'moderate',
      style: 'mixed',
    },
  },
  selectedEquipment: [],
  isLoading: false,
};

export const useAppStore = create<AppStore>((set, get) => {
  console.log('Zustand store initializing...');
  return {
    ...initialState,

    setCurrentStep: (step) => set({ currentStep: step }),

  updatePostureAnalysis: (data) =>
    set((state) => ({
      postureAnalysis: { ...state.postureAnalysis, ...data },
    })),

  updateHealthAssessment: (data) =>
    set((state) => ({
      healthAssessment: { ...state.healthAssessment, ...data },
    })),

  updateUserGoals: (data) =>
    set((state) => ({
      userGoals: { ...state.userGoals, ...data },
    })),

  updateSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),

  setGeneratedProgram: (program) => set({ generatedProgram: program }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

    resetStore: () => set(initialState),

    nextStep: () => {
      const currentStep = get().currentStep;
      if (currentStep < 6) {
        set({ currentStep: (currentStep + 1) as 1 | 2 | 3 | 4 | 5 | 6 });
      }
    },

    previousStep: () => {
      const currentStep = get().currentStep;
      if (currentStep > 1) {
        set({ currentStep: (currentStep - 1) as 1 | 2 | 3 | 4 | 5 | 6 });
      }
    },
  };
});