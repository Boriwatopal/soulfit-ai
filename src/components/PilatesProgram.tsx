'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Loader2, Plus, Save, Printer, Download } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface ExerciseRow {
  no: number;
  equipment: string;
  exercise: string;
  weight: string;
  setsReps: string;
}

export default function PilatesProgram() {
  const { 
    postureAnalysis, 
    healthAssessment, 
    userGoals, 
    generatedProgram,
    setGeneratedProgram,
    previousStep,
    setLoading,
    isLoading 
  } = useAppStore();

  const [exercises, setExercises] = useState<ExerciseRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [programGenerated, setProgramGenerated] = useState(false);

  useEffect(() => {
    if (!programGenerated && !isGenerating && !generatedProgram) {
      generateProgram();
    } else if (generatedProgram && !programGenerated) {
      // Program already exists, just convert to table format
      convertProgramToTable(generatedProgram);
      setProgramGenerated(true);
    }
  }, [programGenerated, isGenerating, generatedProgram]);

  const convertProgramToTable = (program: any) => {
    const exerciseRows: ExerciseRow[] = [];
    let exerciseNo = 1;

    // Add warm-up exercises
    if (program.warmUp) {
      program.warmUp.forEach((exercise: any) => {
        exerciseRows.push({
          no: exerciseNo++,
          equipment: exercise.equipment?.join(', ') || 'แมต',
          exercise: exercise.name,
          weight: 'น้ำหนักตัว',
          setsReps: `${exercise.repetitions || exercise.duration} ${exercise.repetitions ? 'ครั้ง' : 'นาที'}`
        });
      });
    }

    // Add main workout exercises
    if (program.mainWorkout) {
      program.mainWorkout.forEach((exercise: any) => {
        exerciseRows.push({
          no: exerciseNo++,
          equipment: exercise.equipment?.join(', ') || 'แมต',
          exercise: exercise.name,
          weight: exercise.equipment?.includes('weights') ? 'น้ำหนักเบา' : 'น้ำหนักตัว',
          setsReps: `${exercise.sets || 1} เซต × ${exercise.repetitions || exercise.duration} ${exercise.repetitions ? 'ครั้ง' : 'นาที'}`
        });
      });
    }

    // Add cool-down exercises
    if (program.coolDown) {
      program.coolDown.forEach((exercise: any) => {
        exerciseRows.push({
          no: exerciseNo++,
          equipment: exercise.equipment?.join(', ') || 'แมต',
          exercise: exercise.name,
          weight: 'น้ำหนักตัว',
          setsReps: `${exercise.repetitions || exercise.duration} ${exercise.repetitions ? 'ครั้ง' : 'นาที'}`
        });
      });
    }

    setExercises(exerciseRows);
  };

  const generateProgram = async () => {
    setIsGenerating(true);
    setLoading(true);

    try {
      const response = await fetch('/api/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postureAnalysis: postureAnalysis?.analysis || '',
          recommendations: postureAnalysis?.recommendations || [],
          healthAssessment,
          userGoals
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate program');
      }

      const result = await response.json();
      const program = result.data;
      
      setGeneratedProgram(program);
      convertProgramToTable(program);
      setProgramGenerated(true);
    } catch (error) {
      console.error('Error generating program:', error);
      alert('ไม่สามารถสร้างโปรแกรมได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  const handleSave = () => {
    const programData = {
      generatedProgram,
      exercises,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(programData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `soulfit-program-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #1f2937; margin-bottom: 30px;">SoulFit AI - โปรแกรมพิลาทิสส่วนบุคคล</h1>
        <div style="margin-bottom: 20px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">โปรแกรมการออกกำลังกาย</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">ลำดับ (No.)</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">อุปกรณ์ (Equipment)</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">ท่าออกกำลังกาย (Exercise)</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">น้ำหนัก (Weight)</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">จำนวนเซต (Sets/Reps)</th>
            </tr>
          </thead>
          <tbody>
            ${exercises.map(exercise => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${exercise.no}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${exercise.equipment}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${exercise.exercise}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${exercise.weight}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px;">${exercise.setsReps}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
          สร้างโดย SoulFit AI - ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  const handleCreateMore = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postureAnalysis: postureAnalysis?.analysis || '',
          recommendations: postureAnalysis?.recommendations || [],
          healthAssessment,
          userGoals,
          requestMoreExercises: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate additional exercises');
      }

      const result = await response.json();
      const newProgram = result.data;
      
      // Add new exercises to existing list
      const newExercises: ExerciseRow[] = [];
      let exerciseNo = exercises.length + 1;

      if (newProgram.mainWorkout) {
        newProgram.mainWorkout.forEach((exercise: any) => {
          newExercises.push({
            no: exerciseNo++,
            equipment: exercise.equipment?.join(', ') || 'แมต',
            exercise: exercise.name,
            weight: exercise.equipment?.includes('weights') ? 'น้ำหนักเบา' : 'น้ำหนักตัว',
            setsReps: `${exercise.sets || 1} เซต × ${exercise.repetitions || exercise.duration} ${exercise.repetitions ? 'ครั้ง' : 'นาที'}`
          });
        });
      }

      setExercises([...exercises, ...newExercises]);
    } catch (error) {
      console.error('Error generating more exercises:', error);
      alert('ไม่สามารถสร้างท่าออกกำลังกายเพิ่มเติมได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating && !programGenerated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12"
          >
            <Loader2 className="w-16 h-16 text-teal-500 mx-auto animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              กำลังสร้างโปรแกรมส่วนบุคคลของคุณ
            </h2>
            <p className="text-gray-600 mb-4">
              AI ของเรากำลังวิเคราะห์ท่าทาง ข้อมูลสุขภาพ และเป้าหมายของคุณเพื่อสร้างโปรแกรมพิลาทิสที่เหมาะสมที่สุดสำหรับคุณ...
            </p>
            <div className="text-sm text-gray-500">
              อาจใช้เวลาสักครู่
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            โปรแกรมพิลาทิสส่วนบุคคลของคุณ
          </h1>
          <p className="text-xl text-gray-600">
            ท่าออกกำลังกายที่ AI สร้างขึ้นจากการประเมินแบบครบถ้วนของคุณ
          </p>
        </motion.div>
      </div>

      {/* Program Summary */}
      {generatedProgram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-teal-50 to-green-50 rounded-2xl border border-teal-100 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">{generatedProgram.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <div className="text-gray-600">ระยะเวลา</div>
              <div className="font-semibold text-gray-900">{generatedProgram.duration} นาที</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-gray-600">ท่าออกกำลังกายทั้งหมด</div>
              <div className="font-semibold text-gray-900">{exercises.length} ท่า</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-gray-600">จุดเน้น</div>
              <div className="font-semibold text-gray-900">{generatedProgram.targetedIssues?.slice(0, 2).join(', ')}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Exercise Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ลำดับ (No.)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  อุปกรณ์ (Equipment)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ท่าออกกำลังกาย (Exercise)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  น้ำหนัก (Weight)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  จำนวนเซต (Sets/Reps)
                </th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((exercise, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {exercise.no}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exercise.equipment}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                    {exercise.exercise}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exercise.weight}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {exercise.setsReps}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-wrap justify-center gap-4 mb-8"
      >
        <button
          onClick={handleCreateMore}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          สร้างท่าออกกำลังกายเพิ่มเติม
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Save className="w-4 h-4" />
          บันทึกโปรแกรม
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 bg-teal-700 text-white rounded-xl font-medium hover:bg-teal-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Printer className="w-4 h-4" />
          พิมพ์โปรแกรม
        </button>
      </motion.div>

      {/* Program Details */}
      {generatedProgram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">การวิเคราะห์โปรแกรมและคำแนะนำ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">ปัญหาที่ต้องแก้ไข</h4>
              <ul className="space-y-2">
                {generatedProgram.targetedIssues?.map((issue: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">ผลลัพธ์ที่คาดหวัง</h4>
              <ul className="space-y-2">
                {generatedProgram.expectedOutcomes?.map((outcome: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {generatedProgram.reasoning && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">เหตุผลของโปรแกรม</h4>
              <p className="text-sm text-gray-700">{generatedProgram.reasoning}</p>
            </div>
          )}

          {generatedProgram.progressionTips && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">เทคนิคการพัฒนา</h4>
              <ul className="space-y-2">
                {generatedProgram.progressionTips.map((tip: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          onClick={handleBack}
          className="px-8 py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← กลับไปหาเป้าหมาย
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-sm text-gray-500 flex items-center"
        >
          โปรแกรมเสร็จสิ้น! ใช้ปุ่มด้านบนเพื่อบันทึกหรือพิมพ์
        </motion.div>
      </div>
    </div>
  );
}