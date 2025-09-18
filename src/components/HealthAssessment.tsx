'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Edit3, CheckCircle, Loader2, Camera, Plus, X } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useDropzone } from 'react-dropzone';
import { BodyCompositionReport } from '@/types';

export default function HealthAssessment() {
  const { healthAssessment, updateHealthAssessment, nextStep, previousStep, isLoading, setLoading } = useAppStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'conditions'>('upload');
  const [extractedData, setExtractedData] = useState<BodyCompositionReport | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [reportPreview, setReportPreview] = useState<string | null>(null);

  const onReportDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    updateHealthAssessment({
      reportImage: file,
      extractedFromImage: true
    });

    // Create preview
    const url = URL.createObjectURL(file);
    setReportPreview(url);

    // Extract data from image
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('reportImage', file);
      
      const response = await fetch('/api/extract-body-composition', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract data');
      }

      const result = await response.json();
      const data = result.data as BodyCompositionReport;
      
      setExtractedData(data);
      updateHealthAssessment({
        bodyCompositionReport: data
      });
    } catch (error) {
      console.error('Error extracting data:', error);
      alert('ไม่สามารถดึงข้อมูลจากรายงานได้ กรุณาลองใหม่อีกครั้งหรือใส่ข้อมูลแบบตรวจสอบเอง');
      setActiveTab('manual');
    } finally {
      setIsExtracting(false);
    }
  };

  const updateReportField = (field: string, value: any) => {
    const updatedReport = {
      ...healthAssessment.bodyCompositionReport,
      [field]: value
    };
    updateHealthAssessment({
      bodyCompositionReport: updatedReport
    });
  };

  const updateSegmentalData = (bodyPart: string, type: 'muscle' | 'fat', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const updatedReport = {
      ...healthAssessment.bodyCompositionReport,
      segmentalData: {
        ...healthAssessment.bodyCompositionReport?.segmentalData,
        [bodyPart]: {
          ...healthAssessment.bodyCompositionReport?.segmentalData?.[bodyPart as keyof typeof healthAssessment.bodyCompositionReport.segmentalData],
          [type]: numValue
        }
      }
    };
    updateHealthAssessment({
      bodyCompositionReport: updatedReport
    });
  };

  const updateNutritionalAssessment = (field: string, value: string) => {
    const updatedReport = {
      ...healthAssessment.bodyCompositionReport,
      nutritionalAssessment: {
        ...healthAssessment.bodyCompositionReport?.nutritionalAssessment,
        [field]: value
      }
    };
    updateHealthAssessment({
      bodyCompositionReport: updatedReport
    });
  };

  const addCondition = (type: 'healthConditions' | 'injuries', condition: string) => {
    const current = healthAssessment[type] || [];
    updateHealthAssessment({
      [type]: [...current, condition],
    });
  };

  const removeCondition = (type: 'healthConditions' | 'injuries', index: number) => {
    const current = healthAssessment[type] || [];
    updateHealthAssessment({
      [type]: current.filter((_, i) => i !== index),
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onReportDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.pdf'],
    },
    maxFiles: 1,
  });

  const canProceed = () => {
    const report = healthAssessment.bodyCompositionReport;
    return report?.weight && report?.height;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          การวิเคราะห์องค์ประกอบร่างกาย
        </h1>
        <p className="text-lg text-gray-600">
          อัปโหลดรายงานการวิเคราะห์องค์ประกอบร่างกายของคุณ หรือกรอกข้อมูลด้วยตนเองเพื่อการประเมินที่ครอบคลุม
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {[
            { id: 'upload', label: 'อัปโหลดรายงาน', icon: Upload },
            { id: 'manual', label: 'กรอกข้อมูลเอง', icon: Edit3 },
            { id: 'conditions', label: 'ประวัติสุขภาพ', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-teal-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl p-8 shadow-lg mb-8"
        >
          {activeTab === 'upload' && (
            <UploadReportTab
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              isExtracting={isExtracting}
              reportPreview={reportPreview}
              extractedData={extractedData}
              onEditExtracted={() => setActiveTab('manual')}
            />
          )}

          {activeTab === 'manual' && (
            <ManualEntryTab
              bodyCompositionReport={healthAssessment.bodyCompositionReport}
              onUpdateField={updateReportField}
              onUpdateSegmental={updateSegmentalData}
              onUpdateNutritional={updateNutritionalAssessment}
            />
          )}

          {activeTab === 'conditions' && (
            <HealthHistoryTab
              healthConditions={healthAssessment.healthConditions || []}
              injuries={healthAssessment.injuries || []}
              onAddCondition={addCondition}
              onRemoveCondition={removeCondition}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={previousStep}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-300"
        >
          ย้อนกลับ
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed()}
          className={`apple-button px-8 py-3 rounded-xl transition-all duration-300 ${
            !canProceed() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          ไปยังหน้าเป้าหมาย
        </button>
      </div>
    </div>
  );
}

function UploadReportTab({ getRootProps, getInputProps, isDragActive, isExtracting, reportPreview, extractedData, onEditExtracted }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold mb-6 text-center">อัปโหลดรายงานการวิเคราะห์องค์ประกอบร่างกาย</h3>
        <p className="text-gray-600 text-center mb-8">
          อัปโหลดรูปภาพรายงานการวิเคราะห์องค์ประกอบร่างกายของคุณ AI ของเราจะดึงข้อมูลทั้งหมดจากรายงานโดยอัตโนมัติ
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-teal-500 bg-teal-50'
              : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
          }`}
        >
          <input {...getInputProps()} />
          
          {isExtracting ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-teal-500 mx-auto animate-spin" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900">กำลังดึงข้อมูล...</h4>
                <p className="text-gray-600">AI ของเรากำลังอ่านรายงานและดึงข้อมูลการวัดทั้งหมด</p>
              </div>
            </div>
          ) : reportPreview ? (
            <div className="space-y-4">
              <img
                src={reportPreview}
                alt="รายงานการวิเคราะห์องค์ประกอบร่างกาย"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span>อัปโหลดรายงานสำเร็จแล้ว!</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="w-16 h-16 text-gray-400 mx-auto" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900">วางรายงานของคุณที่นี่</h4>
                <p className="text-gray-600">
                  ลากและวางรูปภาพรายงานของคุณ หรือคลิกเพื่อเลือกไฟล์
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  รองรับ: JPG, PNG, WEBP, PDF
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {extractedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-green-200 bg-green-50 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-green-800">ดึงข้อมูลสำเร็จแล้ว!</h4>
            <button
              onClick={onEditExtracted}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300"
            >
              <Edit3 className="w-4 h-4" />
              ตรวจสอบและแก้ไข
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {extractedData.age && (
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-600">อายุ</p>
                <p className="font-semibold">{extractedData.age} ปี</p>
              </div>
            )}
            {extractedData.weight && (
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-600">น้ำหนัก</p>
                <p className="font-semibold">{extractedData.weight} กิโลกรัม</p>
              </div>
            )}
            {extractedData.bmi && (
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-600">BMI</p>
                <p className="font-semibold">{extractedData.bmi}</p>
              </div>
            )}
            {extractedData.bodyFatPercentage && (
              <div className="bg-white p-3 rounded-lg">
                <p className="text-gray-600">ไขมันในร่างกาย</p>
                <p className="font-semibold">{extractedData.bodyFatPercentage}%</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ManualEntryTab({ bodyCompositionReport, onUpdateField, onUpdateSegmental, onUpdateNutritional }: any) {
  const report = bodyCompositionReport || {};

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-semibold mb-6">ข้อมูลพื้นฐาน</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">อายุ</label>
            <input
              type="number"
              value={report.age || ''}
              onChange={(e) => onUpdateField('age', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="28"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เพศ</label>
            <select
              value={report.gender || ''}
              onChange={(e) => onUpdateField('gender', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">เลือกเพศ</option>
              <option value="Male">ชาย</option>
              <option value="Female">หญิง</option>
              <option value="Other">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ส่วนสูง (ซม.) *</label>
            <input
              type="number"
              step="0.1"
              value={report.height || ''}
              onChange={(e) => onUpdateField('height', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="172"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">น้ำหนัก (กิโลกรัม) *</label>
            <input
              type="number"
              step="0.1"
              value={report.weight || ''}
              onChange={(e) => onUpdateField('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="64.3"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-6">รายละเอียดองค์ประกอบร่างกาย</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ดัชนีมวลกาย (BMI)</label>
            <input
              type="number"
              step="0.1"
              value={report.bmi || ''}
              onChange={(e) => onUpdateField('bmi', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="21.7"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ไขมันในร่างกาย (%)</label>
            <input
              type="number"
              step="0.1"
              value={report.bodyFatPercentage || ''}
              onChange={(e) => onUpdateField('bodyFatPercentage', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="11.4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">มวลกล้ามเนื้อ (กิโลกรัม)</label>
            <input
              type="number"
              step="0.1"
              value={report.muscleMass || ''}
              onChange={(e) => onUpdateField('muscleMass', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="54.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">น้ำในร่างกาย (กิโลกรัม)</label>
            <input
              type="number"
              step="0.1"
              value={report.bodyWater || ''}
              onChange={(e) => onUpdateField('bodyWater', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="42.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ไขมันอวัยวะ (cm²)</label>
            <input
              type="number"
              step="0.1"
              value={report.visceralFatArea || ''}
              onChange={(e) => onUpdateField('visceralFatArea', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="40.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">มวลร่างกายไร้ไขมัน (กิโลกรัม)</label>
            <input
              type="number"
              step="0.1"
              value={report.leanBodyMass || ''}
              onChange={(e) => onUpdateField('leanBodyMass', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="57.0"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-6">การวิเคราะห์ตามส่วนของร่างกาย</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left">ส่วนของร่างกาย</th>
                <th className="border border-gray-300 px-4 py-3 text-center">มวลกล้ามเนื้อ (กิโลกรัม)</th>
                <th className="border border-gray-300 px-4 py-3 text-center">มวลไขมัน (กิโลกรัม)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'rightArm', label: 'แขนขวา' },
                { key: 'leftArm', label: 'แขนซ้าย' },
                { key: 'torso', label: 'ลำตัว' },
                { key: 'rightLeg', label: 'ขาขวา' },
                { key: 'leftLeg', label: 'ขาซ้าย' },
              ].map((bodyPart) => (
                <tr key={bodyPart.key} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">{bodyPart.label}</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="number"
                      step="0.1"
                      value={report.segmentalData?.[bodyPart.key]?.muscle || ''}
                      onChange={(e) => onUpdateSegmental(bodyPart.key, 'muscle', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <input
                      type="number"
                      step="0.1"
                      value={report.segmentalData?.[bodyPart.key]?.fat || ''}
                      onChange={(e) => onUpdateSegmental(bodyPart.key, 'fat', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-6">การประเมินสารอาหาร</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { key: 'protein', label: 'โปรตีน', options: ['ต่ำ', 'ปกติ', 'สูง'] },
            { key: 'fat', label: 'ไขมัน', options: ['ต่ำ', 'ต่ำ-ปกติ', 'ปกติ', 'สูง'] },
            { key: 'minerals', label: 'แร่ธาตุ', options: ['ต่ำ', 'ปกติ', 'สูง'] },
            { key: 'water', label: 'น้ำ', options: ['ต่ำ', 'ปกติ', 'สูง'] },
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
              <select
                value={report.nutritionalAssessment?.[item.key] || ''}
                onChange={(e) => onUpdateNutritional(item.key, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกสถานะ</option>
                {item.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthHistoryTab({ healthConditions, injuries, onAddCondition, onRemoveCondition }: any) {
  const [newCondition, setNewCondition] = useState('');
  const [newInjury, setNewInjury] = useState('');

  const addConditionHandler = (type: 'healthConditions' | 'injuries') => {
    const value = type === 'healthConditions' ? newCondition : newInjury;
    if (value.trim()) {
      onAddCondition(type, value.trim());
      if (type === 'healthConditions') {
        setNewCondition('');
      } else {
        setNewInjury('');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">ภาวะสุขภาพ</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="เพิ่มภาวะสุขภาพ..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addConditionHandler('healthConditions')}
          />
          <button
            onClick={() => addConditionHandler('healthConditions')}
            className="apple-button px-4 py-3 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {healthConditions.map((condition: string, index: number) => (
            <span
              key={index}
              className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {condition}
              <button
                onClick={() => onRemoveCondition('healthConditions', index)}
                className="text-teal-600 hover:text-teal-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">การบาดเจ็บที่ผ่านมา</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newInjury}
            onChange={(e) => setNewInjury(e.target.value)}
            placeholder="เพิ่มการบาดเจ็บที่ผ่านมา..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addConditionHandler('injuries')}
          />
          <button
            onClick={() => addConditionHandler('injuries')}
            className="apple-button px-4 py-3 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {injuries.map((injury: string, index: number) => (
            <span
              key={index}
              className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {injury}
              <button
                onClick={() => onRemoveCondition('injuries', index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}