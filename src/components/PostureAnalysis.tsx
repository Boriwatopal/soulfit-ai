'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Eye, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const imagePositions = [
  { id: 'front', label: 'ด้านหน้า', description: 'ยืนตรงหันหน้าเข้าหากล้อง' },
  { id: 'back', label: 'ด้านหลัง', description: 'หันหลังให้กล้อง' },
  { id: 'leftSide', label: 'ด้านข้างซ้าย', description: 'หันด้านข้างซ้ายให้กล้อง' },
  { id: 'rightSide', label: 'ด้านข้างขวา', description: 'หันด้านข้างขวาให้กล้อง' },
];

export default function PostureAnalysis() {
  const { postureAnalysis, updatePostureAnalysis, nextStep, setLoading, isLoading } = useAppStore();
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const onDrop = useCallback(
    (acceptedFiles: File[], position: string) => {
      const file = acceptedFiles[0];
      if (file) {
        const imageKey = `${position}Image` as keyof typeof postureAnalysis;
        updatePostureAnalysis({
          [imageKey]: file,
        });
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [position]: url }));
      }
      setSelectedPosition(null);
    },
    [updatePostureAnalysis]
  );

  const removeImage = (position: string) => {
    const imageKey = `${position}Image` as keyof typeof postureAnalysis;
    updatePostureAnalysis({
      [imageKey]: null,
    });
    
    // Cleanup preview URL
    if (previewUrls[position]) {
      URL.revokeObjectURL(previewUrls[position]);
      setPreviewUrls(prev => {
        const { [position]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleAnalyze = async () => {
    if (!allImagesUploaded) {
      alert('กรุณาอัปโหลดภาพท่าทางครบทั้ง 4 มุมก่อนดำเนินการต่อ');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      imagePositions.forEach(position => {
        const imageKey = `${position.id}Image` as keyof typeof postureAnalysis;
        const file = postureAnalysis[imageKey] as File;
        if (file) {
          formData.append(`${position.id}Image`, file);
        }
      });

      const response = await fetch('/api/analyze-posture', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('การวิเคราะห์ท่าทางล้มเหลว');
      }

      const result = await response.json();
      console.log('วิเคราะห์ท่าทางเสร็จสมบูรณ์');
      
      updatePostureAnalysis({
        analysis: result.analysis,
        recommendations: result.recommendations || [],
      });
      
      nextStep();
    } catch (error) {
      console.error('ข้อผิดพลาดในการวิเคราะห์ท่าทาง:', error);
      alert('การวิเคราะห์ท่าทางล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const allImagesUploaded = imagePositions.every(
    pos => postureAnalysis[`${pos.id}Image` as keyof typeof postureAnalysis]
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          การวิเคราะห์ท่าทาง
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          อัปโหลดภาพที่ชัดเจนจากทั้ง 4 มุมเพื่อการวิเคราะห์ท่าทางที่ครอบคลุม 
          ยืนอย่างธรรมชาติในเสื้อผ้าน้อยที่สุดเพื่อผลลัพธ์ที่ดีที่สุด
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {imagePositions.map((position, index) => {
          const imageKey = `${position.id}Image` as keyof typeof postureAnalysis;
          const hasImage = !!postureAnalysis[imageKey];
          
          return (
            <PostureImageUpload
              key={position.id}
              position={position}
              hasImage={hasImage}
              previewUrl={previewUrls[position.id]}
              onDrop={onDrop}
              onRemove={removeImage}
              index={index}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <button
          onClick={handleAnalyze}
          disabled={!allImagesUploaded || isLoading}
          className={`apple-button px-12 py-4 rounded-2xl text-lg font-medium transition-all duration-300 ${
            !allImagesUploaded || isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-105 shadow-xl'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังวิเคราะห์ท่าทาง...
            </div>
          ) : (
            'วิเคราะห์ท่าทางของฉัน'
          )}
        </button>
        
        {!allImagesUploaded && (
          <p className="text-sm text-gray-500 mt-4">
            กรุณาอัปโหลดภาพครบทั้ง 4 มุมเพื่อเริ่มการวิเคราะห์
          </p>
        )}
      </motion.div>
    </div>
  );
}

function PostureImageUpload({ 
  position, 
  hasImage, 
  previewUrl, 
  onDrop, 
  onRemove, 
  index 
}: {
  position: any;
  hasImage: boolean;
  previewUrl?: string;
  onDrop: (files: File[], position: string) => void;
  onRemove: (position: string) => void;
  index: number;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, position.id),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isDragActive
            ? 'border-teal-500 bg-teal-50 scale-102'
            : hasImage
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
        }`}
      >
        <input {...getInputProps()} />
        
        {hasImage && previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={position.label}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(position.id);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {position.label}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {position.label}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {position.description}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
              <Upload className="w-4 h-4" />
              อัปโหลดภาพ
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}