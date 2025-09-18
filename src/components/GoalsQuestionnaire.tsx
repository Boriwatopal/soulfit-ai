'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Target, Activity, AlertTriangle, Heart, User, Eye } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export default function GoalsQuestionnaire() {
  const { userGoals, updateUserGoals, nextStep, previousStep, postureAnalysis, healthAssessment } = useAppStore();
  const [currentSection, setCurrentSection] = useState(1);

  const sections = [
    { id: 1, title: 'เป้าหมายการออกกำลังกาย', icon: Target, color: 'blue' },
    { id: 2, title: 'พฤติกรรมและแรงจูงใจ', icon: Activity, color: 'green' },
    { id: 3, title: 'ข้อจำกัดและอุปสรรค', icon: AlertTriangle, color: 'amber' },
    { id: 4, title: 'ประวัติสุขภาพ', icon: Heart, color: 'red' },
    { id: 5, title: 'การประเมินร่างกายเบื้องต้น', icon: User, color: 'purple' },
    { id: 6, title: 'ความคาดหวัง', icon: Eye, color: 'indigo' }
  ];

  const handleContinue = () => {
    nextStep();
  };

  const handleBack = () => {
    previousStep();
  };

  const handleSectionComplete = () => {
    if (currentSection < 6) {
      setCurrentSection(currentSection + 1);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">เป้าหมายหลักของคุณคืออะไร?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'ลดไขมัน',
                'เพิ่มน้ำหนัก', 
                'ลดน้ำหนัก',
                'เพิ่มกล้ามเนื้อ',
                'กระชับสัดส่วน',
                'เพิ่มความยืดหยุ่น',
                'บรรเทาอาการออฟฟิศซินโดรม / คลายเครียด / นอนหลับดีขึ้น',
                'ฟื้นฟูหลังการบาดเจ็บ'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => {
                    const goals = userGoals.focusAreas?.includes(goal) 
                      ? userGoals.focusAreas.filter(g => g !== goal)
                      : [...(userGoals.focusAreas || []), goal];
                    updateUserGoals({ focusAreas: goals });
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    userGoals.focusAreas?.includes(goal)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{goal}</div>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อื่นๆ:
              </label>
              <input
                type="text"
                placeholder="โปรดระบุเป้าหมายอื่นๆ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => updateUserGoals({ otherGoals: e.target.value })}
                value={userGoals.otherGoals || ''}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">พฤติกรรมการออกกำลังกายและแรงจูงใจ</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  คุณเคยออกกำลังกายอย่างสม่ำเสมอมาก่อนหรือไม่?
                </label>
                <div className="flex gap-4">
                  {['ใช่', 'ไม่ใช่'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateUserGoals({ hasExercisedBefore: option === 'ใช่' })}
                      className={`px-6 py-3 rounded-xl border-2 transition-all ${
                        userGoals.hasExercisedBefore === (option === 'ใช่')
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  คุณเคยเรียนพิลาทิสมาก่อนหรือไม่?
                </label>
                <div className="flex gap-4">
                  {['ใช่', 'ไม่ใช่'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateUserGoals({ hasPilatesExperience: option === 'ใช่' })}
                      className={`px-6 py-3 rounded-xl border-2 transition-all ${
                        userGoals.hasPilatesExperience === (option === 'ใช่')
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  รูปแบบการออกกำลังกายที่คุณชอบคืออะไร?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['ช้า', 'เร็ว', 'ท้าทาย', 'ผ่อนคลาย'].map((style) => (
                    <button
                      key={style}
                      onClick={() => updateUserGoals({ preferredStyle: (style === 'ช้า' ? 'slow' : style === 'เร็ว' ? 'fast' : style === 'ท้าทาย' ? 'challenging' : 'relaxing') as any })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        userGoals.preferredStyle === (style === 'ช้า' ? 'slow' : style === 'เร็ว' ? 'fast' : style === 'ท้าทาย' ? 'challenging' : 'relaxing')
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ทำไมคุณถึงอยากเริ่มออกกำลังกายตอนนี้?
                </label>
                <textarea
                  placeholder="แรงจูงใจของคุณ..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => updateUserGoals({ motivation: e.target.value })}
                  value={userGoals.motivation || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คุณคาดหวังผลลัพธ์อะไร และในระยะเวลากี่เดือน?
                </label>
                <textarea
                  placeholder="ผลลัพธ์ที่คาดหวังและระยะเวลา..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => updateUserGoals({ expectedResults: e.target.value })}
                  value={userGoals.expectedResults || ''}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">ข้อจำกัดและความกังวล</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ทำไมคุณถึงหยุดออกกำลังกายในอดีตที่ผ่านมา?
                </label>
                <textarea
                  placeholder="อุปสรรคในการออกกำลังกายก่อนหน้านี้..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => updateUserGoals({ pastBarriers: e.target.value })}
                  value={userGoals.pastBarriers || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  อุปสรรคที่อาจเกิดขึ้นที่คุณกังวลคืออะไร?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'ไม่มีเวลา',
                    'ขี้เกียจ', 
                    'ไม่เห็นผล',
                    'เดินทางยาก',
                    'กังวลเรื่องค่าใช้จ่าย',
                    'อื่นๆ'
                  ].map((obstacle) => (
                    <button
                      key={obstacle}
                      onClick={() => {
                        const obstacles = userGoals.potentialObstacles?.includes(obstacle)
                          ? userGoals.potentialObstacles.filter(o => o !== obstacle)
                          : [...(userGoals.potentialObstacles || []), obstacle];
                        updateUserGoals({ potentialObstacles: obstacles });
                      }}
                      className={`p-3 rounded-xl border-2 text-sm transition-all ${
                        userGoals.potentialObstacles?.includes(obstacle)
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {obstacle}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ความกังวลของคุณคืออะไร?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'กลัวการบาดเจ็บ',
                    'ขาดความมั่นใจ',
                    'ประสบการณ์ไม่ดีในอดีต',
                    'ยากเกินไป',
                    'ไม่เห็นผล',
                    'อื่นๆ'
                  ].map((concern) => (
                    <button
                      key={concern}
                      onClick={() => {
                        const concerns = userGoals.concerns?.includes(concern)
                          ? userGoals.concerns.filter(c => c !== concern)
                          : [...(userGoals.concerns || []), concern];
                        updateUserGoals({ concerns: concerns });
                      }}
                      className={`p-3 rounded-xl border-2 text-sm transition-all ${
                        userGoals.concerns?.includes(concern)
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">ประวัติทางการแพทย์</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  คุณมีอาการหรือโรคต่อไปนี้หรือไม่?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'เบาหวาน',
                    'ความดันโลหิตสูง',
                    'หอบหืด',
                    'โรคหัวใจ',
                    'ข้ออักเสบ',
                    'ปัญหาข้อต่อ',
                    'สูบบุหรี่',
                    'หัวใจขาดเลือด',
                    'ปวดหลังลามไปขา',
                    'ปัญหาหลัง',
                    'คอเลสเตอรอลสูง',
                    'เคยผ่าตัด',
                    'โรคเรื้อรัง'
                  ].map((condition) => (
                    <button
                      key={condition}
                      onClick={() => {
                        const conditions = userGoals.medicalConditions?.includes(condition)
                          ? userGoals.medicalConditions.filter(c => c !== condition)
                          : [...(userGoals.medicalConditions || []), condition];
                        updateUserGoals({ medicalConditions: conditions });
                      }}
                      className={`p-3 rounded-xl border-2 text-sm transition-all ${
                        userGoals.medicalConditions?.includes(condition)
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อื่นๆ:
                </label>
                <input
                  type="text"
                  placeholder="โปรดระบุโรคหรืออาการอื่นๆ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => updateUserGoals({ otherMedicalConditions: e.target.value })}
                  value={userGoals.otherMedicalConditions || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  จำเป็นต้องได้รับใบรับรองแพทย์ก่อนเข้าร่วมหรือไม่?
                </label>
                <div className="flex gap-4">
                  {['ใช่', 'ไม่ใช่'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateUserGoals({ medicalReleaseRequired: option === 'ใช่' })}
                      className={`px-6 py-3 rounded-xl border-2 transition-all ${
                        userGoals.medicalReleaseRequired === (option === 'ใช่')
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">การประเมินร่างกายเบื้องต้น</h3>
            <p className="text-sm text-gray-600 mb-6">
              ตรวจสอบข้อมูลร่างกายของคุณจากขั้นตอนการประเมินสุขภาพ เพิ่มการวัดเพิ่มเติมได้ตามต้องการ
            </p>
            
            {/* Display data from Health Assessment */}
            {healthAssessment?.bodyCompositionReport && (
              <div className="bg-teal-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-teal-900 mb-4">จากการประเมินสุขภาพของคุณ</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {healthAssessment.bodyCompositionReport.height && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">ส่วนสูง</div>
                      <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.height} ซม.</div>
                    </div>
                  )}
                  {healthAssessment.bodyCompositionReport.weight && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">น้ำหนัก</div>
                      <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.weight} กก.</div>
                    </div>
                  )}
                  {healthAssessment.bodyCompositionReport.bmi && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">BMI</div>
                      <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.bmi}</div>
                    </div>
                  )}
                  {healthAssessment.bodyCompositionReport.bodyFatPercentage && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">ไขมันในร่างกาย</div>
                      <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.bodyFatPercentage}%</div>
                    </div>
                  )}
                  {healthAssessment.bodyCompositionReport.muscleMass && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">มวลกล้ามเนื้อ</div>
                      <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.muscleMass} กก.</div>
                    </div>
                  )}
                  {healthAssessment.bodyCompositionReport.bodyWater && (
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">น้ำในร่างกาย</div>
                      <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.bodyWater} กก.</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional measurements not in health assessment */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">สัญญาณชีพเพิ่มเติม</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ระดับออกซิเจน (%)</label>
                  <input
                    type="number"
                    placeholder="98"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ oxygenLevel: parseFloat(e.target.value) })}
                    value={userGoals.oxygenLevel || ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ความดันโลหิต</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ bloodPressure: e.target.value })}
                    value={userGoals.bloodPressure || ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">อัตราการเต้นหัวใจขณะพัก (ครั้ง/นาที)</label>
                  <input
                    type="number"
                    placeholder="70"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ restingHeartRate: parseInt(e.target.value) })}
                    value={userGoals.restingHeartRate || ''}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">การวัดร่างกายเพิ่มเติม (ไม่บังคับ)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รอบอก (ซม.)</label>
                  <input
                    type="number"
                    placeholder="90"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ chestMeasurement: parseFloat(e.target.value) })}
                    value={userGoals.chestMeasurement || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รอบเอว (ซม.)</label>
                  <input
                    type="number"
                    placeholder="75"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ waistMeasurement: parseFloat(e.target.value) })}
                    value={userGoals.waistMeasurement || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รอบสะโพก (ซม.)</label>
                  <input
                    type="number"
                    placeholder="95"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ hipMeasurement: parseFloat(e.target.value) })}
                    value={userGoals.hipMeasurement || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รอบแขนซ้าย (ซม.)</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ leftArmMeasurement: parseFloat(e.target.value) })}
                    value={userGoals.leftArmMeasurement || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รอบแขนขวา (ซม.)</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ rightArmMeasurement: parseFloat(e.target.value) })}
                    value={userGoals.rightArmMeasurement || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รอบต้นขาซ้าย (ซม.)</label>
                  <input
                    type="number"
                    placeholder="55"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ leftThighMeasurement: parseFloat(e.target.value) })}
                    value={userGoals.leftThighMeasurement || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รอบต้นขาขวา (ซม.)</label>
                  <input
                    type="number"
                    placeholder="55"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => updateUserGoals({ rightThighMeasurement: parseFloat(e.target.value) })}
                    value={userGoals.rightThighMeasurement || ''}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">ความคาดหวังและข้อมูลเชิงลึก</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คุณอยากเห็นตัวเองเปลี่ยนแปลงอย่างไร?
                </label>
                <textarea
                  placeholder="อธิบายการเปลี่ยนแปลงที่คุณต้องการ..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => updateUserGoals({ desiredTransformation: e.target.value })}
                  value={userGoals.desiredTransformation || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คุณมีแรงบันดาลใจหรือเป้าหมายเฉพาะอะไรบ้าง?
                </label>
                <textarea
                  placeholder="แรงบันดาลใจและเป้าหมายเฉพาะของคุณ..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => updateUserGoals({ inspiration: e.target.value })}
                  value={userGoals.inspiration || ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  คุณชอบผู้สอนแบบไหน?
                </label>
                <div className="flex flex-wrap gap-4">
                  {['ให้กำลังใจ', 'สงบ', 'เข้มงวด'].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateUserGoals({ preferredInstructorType: (type === 'ให้กำลังใจ' ? 'encouraging' : type === 'สงบ' ? 'calm' : 'strict') as any })}
                      className={`px-6 py-3 rounded-xl border-2 transition-all ${
                        userGoals.preferredInstructorType === (type === 'ให้กำลังใจ' ? 'encouraging' : type === 'สงบ' ? 'calm' : 'strict')
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  คุณชอบรูปแบบการฝึกแบบไหน?
                </label>
                <div className="flex flex-wrap gap-4">
                  {['ละเอียด', 'สนุก', 'อื่นๆ'].map((style) => (
                    <button
                      key={style}
                      onClick={() => updateUserGoals({ preferredTrainingStyle: (style === 'ละเอียด' ? 'detailed' : style === 'สนุก' ? 'fun' : 'others') as any })}
                      className={`px-6 py-3 rounded-xl border-2 transition-all ${
                        userGoals.preferredTrainingStyle === (style === 'ละเอียด' ? 'detailed' : style === 'สนุก' ? 'fun' : 'others')
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            เป้าหมายและข้อมูลส่วนตัว
          </h1>
          <p className="text-xl text-gray-600">
            ช่วยให้เราเข้าใจเป้าหมายการออกกำลังกายและความต้องการของคุณ
          </p>
        </motion.div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {sections.map((section) => {
          const isActive = currentSection === section.id;
          const isCompleted = currentSection > section.id;
          const Icon = section.icon;
          
          return (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? `border-2 border-${section.color}-500 bg-${section.color}-50 text-${section.color}-700`
                  : isCompleted
                  ? 'border-2 border-green-500 bg-green-50 text-green-700'
                  : 'border border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.title}
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
      >
        {renderSection()}
        
        {/* Section Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {currentSection > 1 && (
            <button
              onClick={() => setCurrentSection(currentSection - 1)}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← ก่อนหน้า
            </button>
          )}
          
          <div className="flex-1" />
          
          {currentSection < 6 && (
            <button
              onClick={handleSectionComplete}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all"
            >
              ส่วนถัดไป →
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Navigation */}
      {currentSection === 6 && (
        <div className="flex justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onClick={handleBack}
            className="px-8 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← กลับไปวิเคราะห์ท่าทาง
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onClick={handleContinue}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            สร้างโปรแกรม →
          </motion.button>
        </div>
      )}
    </div>
  );
}