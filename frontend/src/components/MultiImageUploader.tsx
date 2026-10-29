import React, { useRef } from 'react';
import { UploadCloud, Camera, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MultiImageUploaderProps {
  selectedCrop: string;
  setSelectedCrop: (c: string) => void;
  selectedPart: string;
  setSelectedPart: (p: string) => void;
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  onOpenCamera: () => void;
  onRunDiagnosis: () => void;
  isAnalyzing: boolean;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  selectedCrop,
  setSelectedCrop,
  selectedPart,
  setSelectedPart,
  images,
  setImages,
  onOpenCamera,
  onRunDiagnosis,
  isAnalyzing
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles].slice(0, 8)); // Max 8 images
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-sm space-y-4">
      {/* Crop and Plant Part Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Target Crop
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="tomato">Tomato (Solanum lycopersicum)</option>
            <option value="rice">Rice / Paddy (Oryza sativa)</option>
            <option value="cotton">Cotton (Gossypium)</option>
            <option value="groundnut">Groundnut / Peanut (Arachis hypogaea)</option>
            <option value="maize">Maize / Corn (Zea mays)</option>
            <option value="chilli">Chilli / Pepper (Capsicum annuum)</option>
            <option value="wheat">Wheat (Triticum aestivum)</option>
            <option value="sugarcane">Sugarcane (Saccharum officinarum)</option>
            <option value="banana">Banana (Musa)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Plant Part
          </label>
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPart(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="leaf">Leaf (Foliage)</option>
            <option value="fruit">Fruit / Pod</option>
            <option value="stem">Stem / Main Shoot</option>
            <option value="whole_plant">Whole Plant Canopy</option>
          </select>
        </div>
      </div>

      {/* Prominent Action Buttons: Open Camera & Upload Multiple Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onOpenCamera}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-800/20 hover:bg-forest-800 active:scale-98 transition-all"
        >
          <Camera size={18} />
          {t('open_camera')}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-forest-50 text-forest-900 border border-forest-200 font-bold text-xs hover:bg-forest-100 active:scale-98 transition-all"
        >
          <UploadCloud size={18} className="text-forest-600" />
          {t('upload_images')}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
      </div>

      {/* Image Preview Thumbnails with Removal */}
      {images.length > 0 ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">
              Selected Photographs ({images.length} / 8)
            </span>
            <button
              onClick={() => setImages([])}
              className="text-[11px] font-semibold text-rose-600 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {images.map((file, idx) => {
              const url = URL.createObjectURL(file);
              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs group"
                >
                  <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/50 text-[9px] text-white px-1.5 py-0.5 rounded-full font-mono">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Run Diagnosis CTA */}
          <button
            onClick={onRunDiagnosis}
            disabled={isAnalyzing}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-forest-800 text-white font-extrabold text-sm shadow-md hover:bg-forest-900 disabled:opacity-50 transition-all"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running AI Vision Pathology Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-amber-400" />
                <span>Analyze Crop Health & Diagnose Pest/Disease</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-forest-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-forest-50/50 transition-colors"
        >
          <ImageIcon size={28} className="mx-auto text-forest-400 mb-2" />
          <p className="text-xs font-semibold text-gray-700">
            Tap to choose multiple crop leaf/plant images
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Supports JPG, PNG up to 10MB each (Batch up to 8 images)
          </p>
        </div>
      )}
    </div>
  );
};
