'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import StepIndicator from '@/components/StepIndicator';
import PostureAnalysis from '@/components/PostureAnalysis';
import HealthAssessment from '@/components/HealthAssessment';
import AnalysisResults from '@/components/AnalysisResults';
import GoalsQuestionnaire from '@/components/GoalsQuestionnaire';
import EquipmentSelection from '@/components/EquipmentSelection';
import PilatesProgram from '@/components/PilatesProgram';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Try to get store state with error handling
  let currentStep = 1;
  try {
    currentStep = useAppStore((state) => state.currentStep);
  } catch (err) {
    console.error('Zustand store error:', err);
    setError('Store initialization error');
  }

  useEffect(() => {
    console.log('Component mounting...');
    setMounted(true);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading SoulFit AI...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering with currentStep:', currentStep);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PostureAnalysis />;
      case 2:
        return <HealthAssessment />;
      case 3:
        return <AnalysisResults />;
      case 4:
        return <GoalsQuestionnaire />;
      case 5:
        return <EquipmentSelection />;
      case 6:
        return <PilatesProgram />;
      default:
        return <PostureAnalysis />;
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SoulFit AI</h1>
                <p className="text-sm text-gray-600">พิลาทิสด้วย AI</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-right"
            >
              <p className="text-sm text-gray-600">ขั้นตอน {currentStep} จาก 6</p>
              <p className="text-xs text-gray-400">เครื่องสร้างโปรแกรมส่วนบุคคล</p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={6} />
        
        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentStep()}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-gray-900">SoulFit AI</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                สร้างโปรแกรมพิลาทิสส่วนบุคคลโดยใช้การวิเคราะห์ AI ขั้นสูง
                เพื่อช่วยให้คุณมีท่าทางที่สมบูรณ์แบบและสุขภาพที่ดีที่สุด
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">คุณสมบัติ</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• การวิเคราะห์ท่าทางด้วย AI</li>
                <li>• โปรแกรมส่วนบุคคล</li>
                <li>• การประเมินสุขภาพ</li>
                <li>• การติดตามความก้าวหน้า</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">ประโยชน์</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• ท่าทางที่ดีขึ้น</li>
                <li>• ลดอาการปวด</li>
                <li>• ความยืดหยุ่นที่ดีขึ้น</li>
                <li>• กล้ามเนื้อหน้าท้องแข็งแรง</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 SoulFit AI. ขับเคลื่อนด้วย AI ขั้นสูงสำหรับการออกกำลังกายส่วนบุคคล
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}