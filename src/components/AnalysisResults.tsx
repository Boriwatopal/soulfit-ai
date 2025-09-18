'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Target, TrendingUp, Activity, Users } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export default function AnalysisResults() {
  const { postureAnalysis, healthAssessment, nextStep, previousStep } = useAppStore();

  const handleBack = () => {
    previousStep();
  };

  const handleContinue = () => {
    nextStep();
  };

  // Combine posture and health data for comprehensive analysis
  const getCombinedAnalysis = () => {
    const postureIssues = [];
    const healthInsights = [];
    const recommendations = [];

    // Extract posture insights
    if (postureAnalysis?.analysis) {
      if (postureAnalysis.analysis.toLowerCase().includes('forward')) {
        postureIssues.push('ตรวจพบท่าทางศีรษะเอียงไปข้างหน้า');
        recommendations.push('มุ่งเน้นการจัดแนวกระดูกสันหลังส่วนคอและเสริมสร้างความแข็งแรงของกล้ามเนื้อคอส่วนลึก');
      }
      if (postureAnalysis.analysis.toLowerCase().includes('rounded')) {
        postureIssues.push('พบไหล่โค้งงอ');
        recommendations.push('เสริมสร้างความแข็งแรงของกล้ามเนื้อส่วนหลังและยืดกล้ามเนื้อหน้าอก');
      }
      if (postureAnalysis.analysis.toLowerCase().includes('tilt')) {
        postureIssues.push('ปัญหาการจัดแนวของเชิงกราน');
        recommendations.push('ต้องการการทำงานของการทรงตัวของกล้ามเนื้อหลักและการเคลื่อนไหวของกล้ามเนื้อเอ็นโป้งขา');
      }
    }

    // Extract health insights
    const report = healthAssessment?.bodyCompositionReport;
    if (report) {
      if (report.bodyFatPercentage) {
        if (report.bodyFatPercentage > 25) {
          healthInsights.push(`เปอร์เซ็นต์ไขมันในร่างกายสูง (${report.bodyFatPercentage}%) อาจส่งผลต่อรูปแบบการเคลื่อนไหว`);
          recommendations.push('รวมแบบฝึกหัดที่เร่งระบบเผาผลาญ');
        } else if (report.bodyFatPercentage < 15) {
          healthInsights.push(`เปอร์เซ็นต์ไขมันในร่างกายต่ำ (${report.bodyFatPercentage}%) แสดงถึงสุขภาพการเผาผลาญที่ดี`);
        }
      }
      
      if (report.muscleMass && report.weight) {
        const musclePercentage = (report.muscleMass / report.weight) * 100;
        if (musclePercentage < 30) {
          healthInsights.push('ตรวจพบมวลกล้ามเนื้อต่ำ - มุ่งเน้นการสร้างความแข็งแรง');
          recommendations.push('จัดลำดับความสำคัญของแบบฝึกหัดพิลาทิสแบบต้านทาน');
        } else {
          healthInsights.push('มีพื้นฐานมวลกล้ามเนื้อที่ดีสำหรับการพัฒนาการออกกำลังกาย');
        }
      }

      if (report.nutritionalAssessment) {
        const nutrition = report.nutritionalAssessment;
        if (nutrition.protein === 'Low') {
          healthInsights.push('ระดับโปรตีนต่ำอาจส่งผลต่อการฟื้นฟูกล้ามเนื้อ');
          recommendations.push('พิจารณาการรับโปรตีนเพื่อการฟื้นฟูการออกกำลังกายที่เหมาะสม');
        }
        if (nutrition.water === 'Low') {
          healthInsights.push('ระดับการดื่มน้ำต่ำกว่าที่เหมาะสม');
          recommendations.push('รักษาการดื่มน้ำที่เหมาะสมระหว่างการออกกำลังกาย');
        }
      }
    }

    return { postureIssues, healthInsights, recommendations };
  };

  const analysis = getCombinedAnalysis();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            การวิเคราะห์ครอบคลุมของคุณ
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ข้อมูลเชิงลึกรวมจากการประเมินท่าทางและโปรไฟล์สุขภาพของคุณ
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Posture Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">การวิเคราะห์ท่าทาง</h2>
              <p className="text-xs text-gray-600">การประเมิน 4 มุม</p>
            </div>
          </div>

          {postureAnalysis?.analysis && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {postureAnalysis.analysis}
              </div>
            </div>
          )}

          {analysis.postureIssues.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">จุดสำคัญที่พบ</h3>
              <div className="space-y-1">
                {analysis.postureIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Health Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">ตัวชี้วัดสุขภาพ</h2>
              <p className="text-xs text-gray-600">ข้อมูลองค์ประกอบร่างกาย</p>
            </div>
          </div>

          {healthAssessment?.bodyCompositionReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {healthAssessment.bodyCompositionReport.bmi && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">ค่า BMI</div>
                    <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.bmi}</div>
                  </div>
                )}
                {healthAssessment.bodyCompositionReport.bodyFatPercentage && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">ไขมันในร่างกาย</div>
                    <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.bodyFatPercentage}%</div>
                  </div>
                )}
                {healthAssessment.bodyCompositionReport.muscleMass && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">มวลกล้ามเนื้อ</div>
                    <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.muscleMass} กก.</div>
                  </div>
                )}
                {healthAssessment.bodyCompositionReport.bodyWater && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">น้ำในร่างกาย</div>
                    <div className="font-semibold text-gray-900">{healthAssessment.bodyCompositionReport.bodyWater} กก.</div>
                  </div>
                )}
              </div>

              {analysis.healthInsights.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">ข้อมูลเชิงลึกด้านสุขภาพ</h3>
                  <div className="space-y-1">
                    {analysis.healthInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <TrendingUp className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Combined Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">คำแนะนำ</h2>
              <p className="text-xs text-gray-600">ข้อมูลเชิงลึกส่วนบุคคล</p>
            </div>
          </div>

          {analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          )}

          {/* Display original posture recommendations if available */}
          {postureAnalysis?.recommendations && postureAnalysis.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2">คำแนะนำเฉพาะด้านท่าทาง</h3>
              <div className="space-y-1">
                {postureAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Target className="w-3 h-3 text-teal-500 mt-1 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Overall Assessment Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl border border-teal-100 p-8 mb-12"
      >
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">การประเมินเสร็จสมบูรณ์</h3>
          <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
            การวิเคราะห์ครอบคลุมของคุณเผยให้เห็นจุดที่ต้องปรับปรุงเฉพาะเจาะจง การผสมผสานระหว่างรูปแบบท่าทางของคุณ
            และข้อมูลองค์ประกอบร่างกายให้รากฐานที่ชัดเจนสำหรับการสร้างโปรแกรมออกกำลังกายส่วนบุคคลที่มีประสิทธิภาพ
          </p>
          
          {(analysis.postureIssues.length > 0 || analysis.healthInsights.length > 0) && (
            <div className="bg-white rounded-xl p-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">จุดสำคัญที่ต้องเน้น</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.postureIssues.length > 0 && (
                  <div>
                    <h5 className="font-medium text-teal-700 mb-2">ความสำคัญด้านท่าทาง</h5>
                    <ul className="space-y-1">
                      {analysis.postureIssues.map((issue, index) => (
                        <li key={index} className="text-sm text-gray-600">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.healthInsights.length > 0 && (
                  <div>
                    <h5 className="font-medium text-green-700 mb-2">ข้อพิจารณาด้านสุขภาพ</h5>
                    <ul className="space-y-1">
                      {analysis.healthInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-600">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={handleBack}
          className="px-8 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← กลับไปการประเมินสุขภาพ
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          onClick={handleContinue}
          className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          ไปยังหน้าเป้าหมาย →
        </motion.button>
      </div>
    </div>
  );
}