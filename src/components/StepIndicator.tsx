'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { id: 1, title: 'Posture Analysis', description: 'Upload 4 posture images' },
  { id: 2, title: 'Health Assessment', description: 'Body composition & metrics' },
  { id: 3, title: 'Goals & Preferences', description: 'Define your objectives' },
  { id: 4, title: 'Your Program', description: 'Personalized Pilates routine' },
];

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full" />
        
        {/* Progress bar fill */}
        <motion.div
          className="absolute top-6 left-0 h-1 progress-bar rounded-full z-10"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {steps.map((step) => (
          <div key={step.id} className="relative z-20 flex flex-col items-center">
            <motion.div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                step.id < currentStep
                  ? 'bg-green-500 text-white'
                  : step.id === currentStep
                  ? 'bg-teal-500 text-white shadow-lg scale-110'
                  : 'bg-white border-2 border-gray-300 text-gray-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {step.id < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                <span className="font-semibold">{step.id}</span>
              )}
            </motion.div>
            
            <div className="text-center max-w-32">
              <h3
                className={`font-semibold text-sm mb-1 transition-colors duration-300 ${
                  step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-xs transition-colors duration-300 ${
                  step.id <= currentStep ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}