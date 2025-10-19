'use client';

import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const EQUIPMENT_OPTIONS = [
  { id: 'Mat', name: 'แมต (Mat)', description: 'เหมาะสำหรับมือใหม่ ไม่ต้องใช้อุปกรณ์พิเศษ' },
  { id: 'Reformer', name: 'รีฟอร์มเมอร์ (Reformer)', description: 'เครื่องพิลาทิสหลัก ให้การต้านทานและช่วยเหลือ' },
  { id: 'Ladder barrel, corrector spine', name: 'แลดเดอร์แบร์เรล, คอร์เรคเตอร์สไปน์ (Ladder barrel, corrector spine)', description: 'ช่วยเพิ่มความยืดหยุ่นและเสริมสร้างกระดูกสันหลัง' },
  { id: 'Cadillac', name: 'คาดิลแลค (Cadillac)', description: 'เครื่องอเนกประสงค์ ช่วยฟื้นฟูและท่าขั้นสูง' },
  { id: 'Chair', name: 'เก้าอี้พิลาทิส (Chair)', description: 'เน้นความแข็งแรงและความสมดุล' },
  { id: 'Arm Chair', name: 'อาร์มแชร์ (Arm Chair)', description: 'เน้นแขนและลำตัวส่วนบน' }
];

export default function EquipmentSelection() {
  const { selectedEquipment, updateSelectedEquipment, nextStep, previousStep } = useAppStore();

  const handleToggleEquipment = (equipmentId: string) => {
    const current = selectedEquipment || [];
    if (current.includes(equipmentId)) {
      updateSelectedEquipment(current.filter(id => id !== equipmentId));
    } else {
      updateSelectedEquipment([...current, equipmentId]);
    }
  };

  const handleContinue = () => {
    if (!selectedEquipment || selectedEquipment.length === 0) {
      alert('กรุณาเลือกอุปกรณ์อย่างน้อย 1 ชนิด');
      return;
    }
    nextStep();
  };

  const handleBack = () => {
    previousStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            เลือกอุปกรณ์ที่คุณต้องการใช้
          </h1>
          <p className="text-xl text-gray-600">
            เลือกอุปกรณ์ที่คุณมีหรือต้องการใช้ในโปรแกรมของคุณ
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EQUIPMENT_OPTIONS.map((equipment) => {
            const isSelected = selectedEquipment?.includes(equipment.id);

            return (
              <button
                key={equipment.id}
                onClick={() => handleToggleEquipment(equipment.id)}
                className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    isSelected
                      ? 'bg-teal-500 border-teal-500'
                      : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 ${
                      isSelected ? 'text-teal-900' : 'text-gray-900'
                    }`}>
                      {equipment.name}
                    </h3>
                    <p className={`text-sm ${
                      isSelected ? 'text-teal-700' : 'text-gray-600'
                    }`}>
                      {equipment.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedEquipment && selectedEquipment.length > 0 && (
          <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-sm text-teal-900">
              <span className="font-semibold">เลือกแล้ว {selectedEquipment.length} ชนิด:</span>{' '}
              {selectedEquipment.map(id => EQUIPMENT_OPTIONS.find(e => e.id === id)?.name).join(', ')}
            </p>
          </div>
        )}
      </motion.div>

      <div className="flex justify-between">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={handleBack}
          className="px-8 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← กลับไปเป้าหมาย
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={handleContinue}
          disabled={!selectedEquipment || selectedEquipment.length === 0}
          className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg ${
            selectedEquipment && selectedEquipment.length > 0
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          สร้างโปรแกรม →
        </motion.button>
      </div>
    </div>
  );
}
